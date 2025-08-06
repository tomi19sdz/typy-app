import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional
import json

from backend.utils.football_api import pobierz_mecze_dla_daty

# Inicjalizacja Firebase Admin SDK
if not firebase_admin._apps:
    firebase_config_str = os.environ.get('__firebase_config', '{}')
    firebase_config = {}
    try:
        firebase_config = json.loads(firebase_config_str)
    except json.JSONDecodeError:
        print("Błąd dekodowania __firebase_config. Używam pustego słownika.")

    if firebase_config:
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
    else:
        print("Brak konfiguracji Firebase. Firestore nie zostanie zainicjalizowany.")

db = firestore.client()

APP_ID = os.environ.get('__app_id', 'default-app-id')

# Kolekcje Firestore
GENERATED_TIPS_COLLECTION = f"artifacts/{APP_ID}/public/data/generated_tips" # Typy oczekujące na sprawdzenie
HISTORICAL_TIPS_COLLECTION = f"artifacts/{APP_ID}/public/data/historical_tips" # Typy z wynikami
CURRENT_DAILY_TIPS_COLLECTION = f"artifacts/{APP_ID}/public/data/current_daily_tips" # Bieżące typy dla danego dnia/slotu

# Zdefiniowane sloty czasowe w UTC
GENERATION_SLOTS_UTC = [time(3, 0), time(12, 0), time(18, 0)]

def get_current_utc_time_and_date():
    """Zwraca aktualny czas i datę w UTC."""
    now_utc = datetime.utcnow()
    return now_utc.date(), now_utc.time()

def get_next_generation_slot_utc() -> Optional[time]:
    """
    Zwraca najbliższy przyszły lub aktualny slot generowania dla bieżącej daty UTC.
    Jeśli wszystkie sloty na dziś minęły, zwraca pierwszy slot na jutro.
    """
    current_date_utc, current_time_utc = get_current_utc_time_and_date()
    
    # Sortujemy sloty, aby upewnić się, że są w kolejności
    sorted_slots = sorted(GENERATION_SLOTS_UTC)

    # Znajdź najbliższy slot, który jeszcze nie minął dzisiaj
    for slot in sorted_slots:
        if current_time_utc <= slot:
            return slot
    
    # Jeśli wszystkie sloty na dziś minęły, następny slot to pierwszy slot jutro
    return sorted_slots[0] if sorted_slots else None

def get_last_generated_slot_info(date_str: str) -> Optional[str]:
    """
    Pobiera informację o ostatnim wygenerowanym slocie dla danej daty.
    Zwraca string w formacie 'HH:MM' lub None.
    """
    try:
        doc_ref = db.collection(CURRENT_DAILY_TIPS_COLLECTION).document(date_str)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get("last_generated_slot")
        return None
    except Exception as e:
        print(f"Błąd podczas pobierania ostatniego wygenerowanego slotu dla {date_str}: {e}")
        return None

def save_current_daily_tips(
    date_str: str,
    time_slot: time,
    main_page_tips: List[Dict[str, Any]],
    analiza_page_tips: List[Dict[str, Any]]
):
    """
    Zapisuje wygenerowane typy dla strony głównej i analizy na dany dzień i slot czasowy.
    """
    try:
        doc_ref = db.collection(CURRENT_DAILY_TIPS_COLLECTION).document(date_str)
        
        # Używamy mapy slotów, aby przechowywać dane dla każdego slotu
        doc_ref.set({
            "last_generated_slot": time_slot.strftime('%H:%M'),
            f"slots.{time_slot.strftime('%H:%M')}.main_page_tips": main_page_tips,
            f"slots.{time_slot.strftime('%H:%M')}.analiza_page_tips": analiza_page_tips,
            "last_updated_utc": datetime.utcnow().isoformat()
        }, merge=True) # merge=True, aby aktualizować tylko konkretne pola
        
        print(f"Zapisano bieżące typy dla {date_str} w slocie {time_slot.strftime('%H:%M')}.")
    except Exception as e:
        print(f"Błąd podczas zapisywania bieżących typów: {e}")

def get_tips_for_current_slot(date_str: str, time_slot: time, tip_type: str) -> List[Dict[str, Any]]:
    """
    Pobiera typy dla bieżącego slotu czasowego i danego typu (main_page_tips/analiza_page_tips).
    """
    try:
        doc_ref = db.collection(CURRENT_DAILY_TIPS_COLLECTION).document(date_str)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            slot_key = time_slot.strftime('%H:%M')
            # Sprawdzamy, czy slot istnieje i czy zawiera żądany typ danych
            if "slots" in data and slot_key in data["slots"] and tip_type in data["slots"][slot_key]:
                return data["slots"][slot_key][tip_type]
        return []
    except Exception as e:
        print(f"Błąd podczas pobierania typów dla slotu {time_slot.strftime('%H:%M')}: {e}")
        return []


def save_tip_for_history(tip: Dict[str, Any], date_str: str):
    """
    Zapisuje wygenerowany typ do kolekcji 'generated_tips' dla danego dnia.
    Te typy są "surowe" i czekają na przetworzenie wyników.
    """
    try:
        doc_ref = db.collection(GENERATED_TIPS_COLLECTION).document(date_str).collection("tips").document(str(tip["id"]))
        doc_ref.set({
            **tip,
            "status": "pending", # Status: 'pending' (oczekujący na wynik), 'processed' (wynik sprawdzony)
            "date_generated": datetime.now().isoformat()
        })
        # print(f"Zapisano wygenerowany typ dla {tip['gospodarz']} vs {tip['gosc']} na dzień {date_str} (do sprawdzenia).")
    except Exception as e:
        print(f"Błąd podczas zapisywania wygenerowanego typu do 'generated_tips': {e}")


def _determine_tip_correctness(tip: Dict[str, Any], actual_result: Dict[str, Any]) -> str:
    """
    Określa, czy typ był poprawny na podstawie rzeczywistego wyniku.
    Zwraca 'correct', 'incorrect', 'draw_correct', 'draw_incorrect' lub 'unknown'.
    """
    if not actual_result or "goals" not in actual_result or actual_result["goals"]["home"] is None or actual_result["goals"]["away"] is None:
        return "unknown" # Nie ma wyniku lub wynik niekompletny

    home_goals = actual_result["goals"]["home"]
    away_goals = actual_result["goals"]["away"]

    predicted_tip = tip["typ"]

    if predicted_tip == "1": # Zwycięstwo gospodarzy
        return "correct" if home_goals > away_goals else "incorrect"
    elif predicted_tip == "2": # Zwycięstwo gości
        return "correct" if away_goals > home_goals else "incorrect"
    elif predicted_tip == "X": # Remis
        return "draw_correct" if home_goals == away_goals else "draw_incorrect"
    elif predicted_tip == "1X": # Gospodarze wygrają lub remis
        return "correct" if home_goals >= away_goals else "incorrect"
    elif predicted_tip == "X2": # Goście wygrają lub remis
        return "correct" if away_goals >= home_goals else "incorrect"
    elif predicted_tip == "Powyżej 2.5 gola":
        return "correct" if (home_goals + away_goals) > 2.5 else "incorrect"
    elif predicted_tip == "Poniżej 2.5 gola":
        return "correct" if (home_goals + away_goals) < 2.5 else "incorrect"
    
    return "unknown"


def check_results_and_store_history(date_to_check_str: Optional[str] = None):
    """
    Sprawdza wyniki meczów dla podanej daty (domyślnie wczoraj)
    i zapisuje je do kolekcji historycznej.
    """
    if date_to_check_str is None:
        date_to_check = datetime.today() - timedelta(days=1)
        date_to_check_str = date_to_check.strftime('%Y-%m-%d')
    else:
        try:
            datetime.strptime(date_to_check_str, '%Y-%m-%d') # Sprawdź format daty
        except ValueError:
            print(f"Nieprawidłowy format daty: {date_to_check_str}. Oczekiwano YYYY-MM-DD.")
            return {"status": "error", "message": "Invalid date format."}

    print(f"Sprawdzanie wyników dla daty: {date_to_check_str}")

    # Pobierz mecze z API dla tej daty
    actual_fixtures = pobierz_mecze_dla_daty(date_to_check_str)
    actual_results_map = {str(f["fixture"]["id"]): f["fixture"] for f in actual_fixtures}

    # Pobierz wygenerowane typy dla tej daty, które są 'pending'
    pending_tips_ref = db.collection(GENERATED_TIPS_COLLECTION).document(date_to_check_str).collection("tips")
    pending_tips_docs = pending_tips_ref.where("status", "==", "pending").stream()

    processed_count = 0
    for doc in pending_tips_docs:
        tip_data = doc.to_dict()
        fixture_id = str(tip_data["id"])
        
        actual_fixture_data = actual_results_map.get(fixture_id)

        if actual_fixture_data:
            correctness = _determine_tip_correctness(tip_data, actual_fixture_data)
            
            # Zapisz do historii
            history_doc_ref = db.collection(HISTORICAL_TIPS_COLLECTION).document(fixture_id)
            history_doc_ref.set({
                **tip_data,
                "actual_home_goals": actual_fixture_data["goals"]["home"],
                "actual_away_goals": actual_fixture_data["goals"]["away"],
                "is_correct": correctness,
                "processed_date": datetime.now().isoformat()
            })
            
            # Zaktualizuj status w kolekcji generated_tips
            doc.reference.update({"status": "processed"})
            processed_count += 1
            print(f"Przetworzono typ dla {tip_data['gospodarz']} vs {tip_data['gosc']}. Wynik: {actual_fixture_data['goals']['home']}-{actual_fixture_data['goals']['away']}, Poprawność: {correctness}")
        else:
            print(f"Brak rzeczywistego wyniku dla meczu {tip_data['gospodarz']} vs {tip_data['gosc']} (ID: {fixture_id}) na dzień {date_to_check_str}. Pozostawiono jako 'pending'.")

    print(f"Zakończono sprawdzanie wyników dla {date_to_check_str}. Przetworzono {processed_count} typów.")
    return {"status": "success", "message": f"Przetworzono {processed_count} typów dla {date_to_check_str}."}

def get_historical_tips() -> List[Dict[str, Any]]:
    """
    Pobiera wszystkie historyczne typy z Firestore.
    """
    try:
        docs = db.collection(HISTORICAL_TIPS_COLLECTION).stream()
        historical_tips = []
        for doc in docs:
            historical_tips.append(doc.to_dict())
        # Sortowanie od najnowszych
        historical_tips.sort(key=lambda x: x.get("data", ""), reverse=True)
        print(f"Pobrano {len(historical_tips)} historycznych typów.")
        return historical_tips
    except Exception as e:
        print(f"Błąd podczas pobierania historycznych typów: {e}")
        return []

