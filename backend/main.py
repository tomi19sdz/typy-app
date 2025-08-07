from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from datetime import datetime, timedelta
from backend.typy_analityczne import generuj_typy_na_dzien
from backend.firestore_utils import pobierz_typy_z_historii, zapisz_typy_na_dzien

app = FastAPI()

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

@app.get("/")
def root():
    """Endpoint testowy dla sprawdzenia, czy backend działa."""
    return {"message": "Backend działa!"}

@app.get("/api/typy")
def typy_na_jutro() -> List[Dict]:
    """
    Endpoint zwracający wygenerowane lub zapisane typy meczów na jutro.
    """
    return generuj_typy_na_dzien()

@app.get("/api/historia")
def historia_typow() -> Dict[str, List[Dict]]:
    """
    Endpoint zwracający wszystkie historyczne typy, pogrupowane po dacie.
    """
    return pobierz_typy_z_historii()

@app.post("/api/zapisz-typy-historie")
def zapisz_typy_historie(typy: List[Dict]):
    """
    Endpoint do ręcznego zapisywania typów do historii.
    Przyjmuje listę typów i zapisuje je pod dzisiejszą datą.
    """
    if not typy:
        raise HTTPException(status_code=400, detail="Brak typów do zapisania.")

    data_dzisiaj = datetime.today().strftime('%Y-%m-%d')
    zapisz_typy_na_dzien(data_dzisiaj, typy)
    
    return {"message": f"Typy na dzień {data_dzisiaj} zostały pomyślnie zapisane."}

