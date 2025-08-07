import requests
import os
from datetime import datetime, timedelta
from typing import List, Dict

def pobierz_mecze_na_jutro() -> List[Dict]:
    """Pobiera listę meczów na jutrzejszy dzień z API Football."""
    
    api_key = os.environ.get("FOOTBALL_API_KEY")
    if not api_key:
        print("Brak klucza API 'FOOTBALL_API_KEY'.")
        return []

    url = "https://v3.football.api-sports.io/fixtures"
    
    # Oblicz datę jutra
    jutro = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    
    querystring = {"date": jutro}
    
    headers = {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": api_key
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()  # Rzuca błędem, jeśli status nie jest 2xx
        data = response.json()
        
        # Sprawdzamy, czy klucz 'response' istnieje i czy zawiera dane
        if 'response' in data and len(data['response']) > 0:
            return data['response']
        else:
            print(f"API nie zwróciło żadnych meczów na dzień {jutro}.")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"Błąd podczas pobierania danych z API: {e}")
        return []
    except Exception as e:
        print(f"Nieoczekiwany błąd: {e}")
        return []

