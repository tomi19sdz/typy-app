from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # Dodaj import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timedelta
import json

# Importy z Twoich plików logiki
from typy_analityczne import generuj_typy_na_jutro
from typy_analityczne_rozszerzone import generuj_typy_rozszerzone_na_jutro
from history_manager import save_generated_tip, check_results_and_store_history, get_historical_tips
from email_sender import send_contact_email # Dodaj import dla wysyłki e-maila

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

@app.get("/")
def root():
    """Endpoint testowy dla sprawdzenia, czy backend działa."""
    return {"message": "Backend działa!"}

@app.get("/api/typy")
def typy_na_jutro_main_page() -> List[Dict[str, Any]]:
    """
    Endpoint zwracający wygenerowane typy meczów dla strony głównej (prawdopodobieństwo > 60%).
    Zapisuje wygenerowane typy do Firestore.
    """
    generated_tips = generuj_typy_na_jutro()
    today_str = datetime.today().strftime('%Y-%m-%d')
    for tip in generated_tips:
        save_generated_tip(tip, today_str)
    return generated_tips

@app.get("/api/typy-analiza")
def typy_na_jutro_analiza_page() -> List[Dict[str, Any]]:
    """
    Endpoint zwracający wygenerowane typy meczów dla zakładki Analiza (prawdopodobieństwo > 70% i rozszerzona analiza).
    Zapisuje wygenerowane typy do Firestore.
    """
    generated_tips = generuj_typy_rozszerzone_na_jutro()
    today_str = datetime.today().strftime('%Y-%m-%d')
    for tip in generated_tips:
        save_generated_tip(tip, today_str)
    return generated_tips

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
def get_history_tips() -> List[Dict[str, Any]]:
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

