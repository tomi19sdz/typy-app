import os
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from typing import List, Dict

# Inicjalizacja Firebase z użyciem zmiennej środowiskowej
try:
    cred_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    if cred_path:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firestore został pomyślnie zainicjowany.")
    else:
        print("Brak zmiennej środowiskowej GOOGLE_APPLICATION_CREDENTIALS. Firebase nie zostanie zainicjowany.")
        db = None
except Exception as e:
    print(f"Błąd podczas inicjalizacji Firebase: {e}")
    db = None

def zapisz_typy_na_dzien(data: str, typy: List[Dict]):
    """Zapisuje listę typów na dany dzień do bazy danych."""
    if not db:
        print("Firestore nie jest zainicjowany, nie można zapisać danych.")
        return
    
    try:
        doc_ref = db.collection('historia_typow').document(data)
        doc_ref.set({'typy': typy, 'timestamp': firestore.SERVER_TIMESTAMP})
        print(f"Typy na dzień {data} zostały pomyślnie zapisane w Firestore.")
    except Exception as e:
        print(f"Błąd podczas zapisywania typów do Firestore: {e}")

def pobierz_typy_na_dzien(data: str) -> List[Dict]:
    """Pobiera typy na dany dzień z bazy danych."""
    if not db:
        print("Firestore nie jest zainicjowany, nie można pobrać danych.")
        return []

    try:
        doc_ref = db.collection('historia_typow').document(data)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get('typy', [])
        else:
            return []
    except Exception as e:
        print(f"Błąd podczas pobierania typów z Firestore: {e}")
        return []

def pobierz_typy_z_historii() -> Dict[str, List[Dict]]:
    """Pobiera wszystkie typy z historii, grupując je po dacie."""
    if not db:
        print("Firestore nie jest zainicjowany, nie można pobrać danych.")
        return {}
    
    historia = {}
    try:
        docs = db.collection('historia_typow').stream()
        for doc in docs:
            historia[doc.id] = doc.to_dict().get('typy', [])
    except Exception as e:
        print(f"Błąd podczas pobierania historii z Firestore: {e}")
        return {}
        
    return historia

