from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, time
import json

# Importy z Twoich plików logiki
from typy_analityczne import generuj_typy_na_jutro # Generuje typy dla strony głównej (>60%)
from typy_analityczne_rozszerzone import generuj_typy_rozszerzone_na_jutro # Generuje typy dla analizy (>70%)
from history_manager import (
    save_tip_for_history,
    check_results_and_store_history,
    get_historical_tips,
    get_current_utc_time_and_date,
    get_next_generation_slot_utc,
    get_last_generated_slot_info,
    save_current_daily_tips,
    get_tips_for_current_slot,
    GENERATION_SLOTS_UTC # Importujemy sloty czasowe
)
from email_sender import send_contact_email

app = FastAPI()

# Konfiguracja CORS
origins = [
    "https://typy-app.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model danych dla formularza kontaktowego
class ContactForm(BaseModel):
    name: str
    email: str
    message: str

async def _ensure_tips_generated_for_current_slot(is_analiza_page: bool = False):
    """
    Sprawdza, czy typy dla bieżącego slotu czasowego zostały wygenerowane.
    Jeśli nie, generuje je i zapisuje do Firestore.
    """
    current_date_utc, current_time_utc = get_current_utc_time_and_date()
    current_date_str = current_date_utc.strftime('%Y-%m-%d')
    
    # Znajdź najbliższy slot, który powinien być aktywny
    target_slot = None
    for slot in sorted(GENERATION_SLOTS_UTC, reverse=True): # Od najnowszego do najstarszego
        if current_time_utc >= slot:
            target_slot = slot
            break
    
    # Jeśli wszystkie sloty na dziś jeszcze nie nadeszły, użyj pierwszego slotu
    if target_slot is None:
        target_slot = GENERATION_SLOTS_UTC[0] if GENERATION_SLOTS_UTC else None

    if target_slot is None:
        print("Brak zdefiniowanych slotów generowania.")
        return # Brak slotów do generowania

    target_slot_str = target_slot.strftime('%H:%M')
    last_generated_slot = get_last_generated_slot_info(current_date_str)

    # Sprawdzamy, czy typy dla tego slotu zostały już wygenerowane
    # Lub czy ostatnio wygenerowany slot jest starszy niż obecny docelowy slot
    should_generate = False
    if last_generated_slot is None:
        should_generate = True
    else:
        last_slot_time = datetime.strptime(last_generated_slot, '%H:%M').time()
        # Jeśli ostatnio wygenerowany slot jest starszy niż obecny target_slot
        if last_slot_time < target_slot:
            should_generate = True
        # Edge case: jeśli jesteśmy w nowym dniu, a ostatni slot był z poprzedniego dnia
        # (chociaż Firestore jest keyed by date, więc to mniej prawdopodobne)
        
    print(f"Aktualny czas UTC: {current_time_utc.strftime('%H:%M')}, Docelowy slot: {target_slot_str}, Ostatnio wygenerowany slot: {last_generated_slot}, Czy generować: {should_generate}")

    if should_generate:
        print(f"Generowanie nowych typów dla {current_date_str} w slocie {target_slot_str}...")
        main_tips = generuj_typy_na_jutro()
        analiza_tips = generuj_typy_rozszerzone_na_jutro()
        
        save_current_daily_tips(current_date_str, target_slot, main_tips, analiza_tips)
        
        # Zapisz wygenerowane typy do kolekcji 'generated_tips' do późniejszego sprawdzenia wyników
        for tip in main_tips:
            save_tip_for_history(tip, current_date_str)
        for tip in analiza_tips: # Zapisz też te z analizy, jeśli są inne
            save_tip_for_history(tip, current_date_str)
        print("Generowanie i zapisywanie zakończone.")
    else:
        print(f"Typy dla {current_date_str} w slocie {target_slot_str} już wygenerowane. Używam zapisanych.")


@app.get("/")
def root():
    """Endpoint testowy dla sprawdzenia, czy backend działa."""
    return {"message": "Backend działa!"}

@app.get("/api/typy")
async def get_main_page_tips() -> Dict[str, Any]: # Zmieniono typ zwracany na Dict[str, Any]
    """
    Endpoint zwracający wygenerowane typy meczów dla strony głównej (prawdopodobieństwo > 60%).
    Typy są generowane tylko o określonych porach dnia.
    Zwraca listę typów i czas ich generowania.
    """
    await _ensure_tips_generated_for_current_slot(is_analiza_page=False)
    current_date_utc, _ = get_current_utc_time_and_date()
    current_date_str = current_date_utc.strftime('%Y-%m-%d')
    
    # Pobierz aktualny slot generowania
    target_slot = None
    for slot in sorted(GENERATION_SLOTS_UTC, reverse=True):
        if datetime.utcnow().time() >= slot: # Użyj aktualnego czasu UTC do wyboru slotu
            target_slot = slot
            break
    if target_slot is None: # Jeśli jeszcze nie minął żaden slot dzisiaj
        target_slot = GENERATION_SLOTS_UTC[0] if GENERATION_SLOTS_UTC else None

    if target_slot is None:
        return {"tips": [], "generated_at_utc": None} # Zwróć pusty słownik

    # Pobierz dane w nowej strukturze
    data = get_tips_for_current_slot(current_date_str, target_slot, "main_page_tips")
    return data # data będzie już słownikiem {"tips": [...], "generated_at_utc": "..."}

@app.get("/api/typy-analiza")
async def get_analiza_page_tips() -> Dict[str, Any]: # Zmieniono typ zwracany na Dict[str, Any]
    """
    Endpoint zwracający wygenerowane typy meczów dla zakładki Analiza (prawdopodobieństwo > 70% i rozszerzona analiza).
    Typy są generowane tylko o określonych porach dnia.
    Zwraca listę typów i czas ich generowania.
    """
    await _ensure_tips_generated_for_current_slot(is_analiza_page=True)
    current_date_utc, _ = get_current_utc_time_and_date()
    current_date_str = current_date_utc.strftime('%Y-%m-%d')

    # Pobierz aktualny slot generowania
    target_slot = None
    for slot in sorted(GENERATION_SLOTS_UTC, reverse=True):
        if datetime.utcnow().time() >= slot: # Użyj aktualnego czasu UTC do wyboru slotu
            target_slot = slot
            break
    if target_slot is None: # Jeśli jeszcze nie minął żaden slot dzisiaj
        target_slot = GENERATION_SLOTS_UTC[0] if GENERATION_SLOTS_UTC else None
    
    if target_slot is None:
        return {"tips": [], "generated_at_utc": None} # Zwróć pusty słownik

    # Pobierz dane w nowej strukturze
    data = get_tips_for_current_slot(current_date_str, target_slot, "analiza_page_tips")
    return data # data będzie już słownikiem {"tips": [...], "generated_at_utc": "..."}

@app.post("/api/check-history")
def trigger_check_history(date: Optional[str] = None):
    """
    Endpoint do ręcznego wywołania sprawdzania wyników dla podanej daty (domyślnie wczoraj).
    """
    result = check_results_and_store_history(date)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@app.get("/api/historia")
def get_history_tips_endpoint() -> List[Dict[str, Any]]:
    """
    Endpoint zwracający historyczne typy meczów.
    """
    return get_historical_tips()

@app.post("/api/send-email")
async def send_email_from_contact_form(form_data: ContactForm):
    """
    Endpoint do wysyłania wiadomości e-mail z formularza kontaktowego.
    """
    success = send_contact_email(form_data.name, form_data.email, form_data.message)
    if success:
        return {"message": "Wiadomość wysłana pomyślnie!"}
    else:
        raise HTTPException(status_code=500, detail="Nie udało się wysłać wiadomości e-mail.")

