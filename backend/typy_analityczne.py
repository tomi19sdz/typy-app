from backend.utils.football_api import pobierz_mecze_na_jutro
from backend.firestore_utils import pobierz_typy_na_dzien
from datetime import datetime, timedelta
from typing import List, Dict
import random

def generuj_typy_na_dzien() -> List[Dict]:
    """
    Generuje typy na jutro, najpierw sprawdzając, czy nie zostały już
    wcześniej zapisane w bazie danych.
    """
    data_jutro = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    
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
            home = fixture.get("teams", {}).get("home", {})
            away = fixture.get("teams", {}).get("away", {})
            date = fixture.get("fixture", {}).get("date")
            
            # Prosta logika analizy i generowania typu
            if home and away and date:
                # Losujemy kurs i prawdopodobieństwo, aby symulować bardziej złożoną logikę
                kurs = round(random.uniform(1.5, 2.5), 2)
                prawdopodobienstwo = random.randint(55, 85)
                
                analiza = f"Spotkanie między {home['name']} a {away['name']}. Analiza sugeruje typ 1 z powodu przewagi gospodarzy."

                typ = {
                    "data": date[:10],
                    "gospodarz": home["name"],
                    "gosc": away["name"],
                    "typ": "1",
                    "kurs": kurs,
                    "prawdopodobienstwo": prawdopodobienstwo,
                    "analiza": analiza
                }
                typy.append(typ)
    else:
        print("Pobrane dane z API nie są listą meczów. Zwracam pustą listę.")
        return []
    
    return typy