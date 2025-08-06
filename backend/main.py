from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from .typy_analityczne import generuj_typy_na_jutro

app = FastAPI()

# WAŻNE: Zezwól na połączenia z Vercel i localhost
# Upewnij się, że "https://typy-app.vercel.app" to DOKŁADNY adres Twojej aplikacji na Vercel
origins = [
    "https://typy-app.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Lista dozwolonych domen
    allow_credentials=True,         # Pozwala na wysyłanie ciasteczek w żądaniach cross-origin
    allow_methods=["*"],            # Pozwala na wszystkie metody HTTP (GET, POST, PUT, DELETE, itp.)
    allow_headers=["*"],            # Pozwala na wszystkie nagłówki HTTP
)

@app.get("/")
def root():
    """Endpoint testowy dla sprawdzenia, czy backend działa."""
    return {"message": "Backend działa!"}

@app.get("/api/typy")
def typy_na_jutro() -> List[Dict]:
    """
    Endpoint zwracający wygenerowane typy meczów.
    """
    return generuj_typy_na_jutro()

