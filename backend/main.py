from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict # Dodaj ten import
from .typy_analityczne import generuj_typy_na_jutro # Poprawiony import względny

app = FastAPI()

# WAŻNE: Zezwól na połączenia z Vercel i localhost
origins = [
    "https://typy-app.vercel.app",  # DOKŁADNY adres Twojej aplikacji na Vercel
    "http://localhost:3000",        # Dla lokalnych testów frontendu
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Lista dozwolonych domen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Endpoint testowy dla sprawdzenia, czy backend działa."""
    return {"message": "Backend działa!"}

@app.get("/api/typy")
def typy_na_jutro() -> List[Dict]: # Dodaj typowanie dla czytelności
    """
    Endpoint zwracający wygenerowane typy meczów.
    """
    return generuj_typy_na_jutro()

