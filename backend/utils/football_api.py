import requests
from datetime import datetime, timedelta

API_KEY = "8dfc23b74ee7404e7ee7ab29d91532c2"
BASE_URL = "https://v3.football.api-sports.io"

headers = {"x-apisports-key": API_KEY}

def get_typy():
    jutro = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    matches = requests.get(f"{BASE_URL}/fixtures?date={jutro}", headers=headers).json()

    typy = []
    for m in matches.get("response", []):
        # przykładowa logika — tu potem wstawisz analizę rankingu, składów, formy itd.
        prawdopodobienstwo = 65  # mock do testów
        if prawdopodobienstwo >= 60:
            typy.append({
                "mecz": f"{m['teams']['home']['name']} vs {m['teams']['away']['name']}",
                "typ": "1",  # np. zwycięstwo gospodarzy
                "kurs": 1.85,
                "prawdopodobienstwo": prawdopodobienstwo,
                "analiza": "Przykładowa analiza formy i składu."
            })
    return typy
