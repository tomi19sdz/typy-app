import requests
from datetime import datetime, timedelta

# WAŻNE: Klucz API powinien być w zmiennej środowiskowej
# Na Render.com ustawiasz to w sekcji Environment Variables
# Lokalnie możesz użyć python-dotenv, ale na razie dla testów umieszczę go tutaj
# W PRODUCTION ZAWSZE UŻYWAJ ZMIENNYCH ŚRODOWISKOWYCH!
API_KEY = "8dfc23b74ee7404e7ee7ab29d91532c2" # Upewnij się, że to Twój klucz API
API_URL = "https://v3.football.api-sports.io"

headers = {
    "x-apisports-key": API_KEY
}

def pobierz_mecze_na_jutro():
    """
    Pobiera mecze piłkarskie na jutro z API Football-API.
    """
    jutro = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    url = f"{API_URL}/fixtures?date={jutro}&timezone=Europe/Warsaw"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status() # Zgłosi błąd dla statusów 4xx/5xx
        data = response.json()
        
        if data.get("response"):
            return data["response"]
        else:
            print("API response does not contain 'response' key or it's empty.")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Błąd podczas pobierania meczów z API: {e}")
        return []

