from backend.utils.football_api import pobierz_mecze_na_jutro
from backend.firestore_utils import pobierz_typy_na_dzien
from datetime import datetime, timedelta
from typing import List, Dict

def generuj_typy_na_dzien() -> List[Dict]:
    """
    Generuje typy na jutro, najpierw sprawdzając, czy nie zostały już
    wcześniej zapisane w bazie danych, aby uniknąć zbędnych zapytań API.
    """
    data_jutro = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    # Sprawdź, czy typy na jutro już istnieją w Firestore
    zapisane_typy = pobierz_typy_na_dzien(data_jutro)
    if zapisane_typy:
        print(f"Typy na dzień {data_jutro} znaleziono w bazie danych. Zwracam zapisane dane.")
        return zapisane_typy

    print(f"Typy na dzień {data_jutro} nie znaleziono. Generuję nowe typy.")
    
    try:
        mecze = pobierz_mecze_na_jutro()
    except Exception as e:
        print(f"Błąd podczas pobierania meczów z zewnętrznego API: {e}")
        return []

    typy = []
    if isinstance(mecze, list):
        for fixture in mecze:
            home = fixture["teams"]["home"]
            away = fixture["teams"]["away"]
            date = fixture["fixture"]["date"]
            
            if home.get("winner") is None and away.get("winner") is None:
                analiza = f"{home['name']} w dobrej formie, grają u siebie. {away['name']} nie wygrał ostatnich meczów."
                typ = {
                    "data": date[:10],
                    "gospodarz": home["name"],
                    "gosc": away["name"],
                    "typ": "1",
                    "kurs": 1.80,
                    "prawdopodobienstwo": 65,
                    "analiza": analiza
                }
                typy.append(typ)
    else:
        print("Pobrane dane z API nie są listą meczów. Zwracam pustą listę.")
        return []
    
    return typy
