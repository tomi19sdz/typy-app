import requests
from datetime import datetime, timedelta

API_KEY = "8dfc23b74ee7404e7ee7ab29d91532c2"
API_URL = "https://v3.football.api-sports.io"

headers = {
    "x-apisports-key": API_KEY
}

def pobierz_mecze_na_jutro():
    jutro = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    url = f"{API_URL}/fixtures?date={jutro}&timezone=Europe/Warsaw"

    response = requests.get(url, headers=headers)
    data = response.json()

    if data.get("response"):
        return data["response"]
    else:
        return []