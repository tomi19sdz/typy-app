import os
import json
from typing import List, Dict
from firebase_admin import credentials, firestore
import firebase_admin

# Inicjalizacja Firebase z użyciem globalnych zmiennych dostarczonych przez Canvas.
# Używamy try-except, aby obsłużyć przypadek, gdy zmienne nie są zdefiniowane.
try:
    firebase_config = json.loads(__firebase_config)
    app_id = __app_id
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firestore został pomyślnie zainicjowany.")
except NameError:
    print("Błąd: Globalne zmienne Canvas nie są zdefiniowane. Firestore nie zostanie zainicjowany.")
    db = None
except Exception as e:
    print(f"Błąd podczas inicjalizacji Firebase: {e}")
    db = None

def zapisz_typy_na_dzien(data_string: str, typy: List[Dict]):
    """
    Zapisuje listę typów do Firestore dla danego dnia.
    Każdy dzień to oddzielny dokument. Dane są serializowane do JSON.
    """
    if not db:
        print("Firestore nie jest zainicjowany, nie można zapisać danych.")
        return
    
    collection_path = f"artifacts/{app_id}/public/data/typy_historii"
    doc_ref = db.collection(collection_path).document(data_string)
    
    try:
        # Serializujemy listę typów do ciągu JSON
        typy_json = json.dumps(typy)
        doc_ref.set({"typy": typy_json})
        print(f"Pomyślnie zapisano typy na dzień: {data_string}")
    except Exception as e:
        print(f"Błąd podczas zapisu do Firestore: {e}")

def pobierz_typy_z_historii() -> Dict[str, List[Dict]]:
    """
    Pobiera wszystkie historyczne typy z Firestore i zwraca je posortowane
    według daty. Dane są deserializowane z JSON.
    """
    if not db:
        print("Firestore nie jest zainicjowany, nie można pobrać danych.")
        return {}

    historia_typow = {}
    collection_path = f"artifacts/{app_id}/public/data/typy_historii"

    try:
        docs = db.collection(collection_path).stream()
        for doc in docs:
            data = doc.to_dict()
            if 'typy' in data:
                # Deserializujemy ciąg JSON z powrotem do listy
                typy_list = json.loads(data['typy'])
                historia_typow[doc.id] = typy_list
    except Exception as e:
        print(f"Błąd podczas pobierania historii z Firestore: {e}")
    
    return historia_typow

def pobierz_typy_na_dzien(data_string: str) -> List[Dict] | None:
    """
    Pobiera typy z Firestore dla danego dnia i zwraca je jako listę.
    """
    if not db:
        return None
        
    collection_path = f"artifacts/{app_id}/public/data/typy_historii"
    doc_ref = db.collection(collection_path).document(data_string)
    
    try:
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            if 'typy' in data:
                return json.loads(data['typy'])
        return None
    except Exception as e:
        print(f"Błąd podczas pobierania typów na dzień {data_string} z Firestore: {e}")
        return None
