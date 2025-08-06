import firebase_admin
from firebase_admin import credentials, firestore
import json
from typing import List, Dict

# Inicjalizacja Firebase z globalnymi zmiennymi
# Te zmienne są dostarczane przez środowisko Canvas
# Upewnij się, że nie zmieniasz ich nazw.
firebase_config = json.loads(__firebase_config) if '__firebase_config' in globals() else {}
initial_auth_token = __initial_auth_token if '__initial_auth_token' in globals() else None
app_id = __app_id if '__app_id' in globals() else 'default-app-id'

# Inicjalizacja Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_config)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def zapisz_typy_na_dzien(data_string: str, typy: List[Dict]):
    """
    Zapisuje listę typów do Firestore dla danego dnia.
    Każdy dzień to oddzielny dokument.
    """
    # Ścieżka do kolekcji publicznych danych
    collection_path = f"artifacts/{app_id}/public/data/typy_historii"
    doc_ref = db.collection(collection_path).document(data_string)
    
    try:
        # Serializujemy listę typów do ciągu JSON, aby uniknąć problemów z Firestore
        typy_json = json.dumps(typy)
        doc_ref.set({"typy": typy_json})
        print(f"Pomyślnie zapisano typy na dzień: {data_string}")
    except Exception as e:
        print(f"Błąd podczas zapisu do Firestore: {e}")

def pobierz_typy_z_historii() -> Dict[str, List[Dict]]:
    """
    Pobiera wszystkie historyczne typy z Firestore i zwraca je posortowane
    według daty.
    """
    collection_path = f"artifacts/{app_id}/public/data/typy_historii"
    
    try:
        docs = db.collection(collection_path).stream()
        historia_typow = {}
        for doc in docs:
            # Deserializujemy ciąg JSON z powrotem do listy
            data = doc.to_dict()
            if 'typy' in data:
                typy_list = json.loads(data['typy'])
                historia_typow[doc.id] = typy_list
        
        return historia_typow
    except Exception as e:
        print(f"Błąd podczas pobierania z Firestore: {e}")
        return {}

def pobierz_typy_na_dzien(data_string: str) -> List[Dict] | None:
    """
    Pobiera typy z Firestore dla danego dnia.
    """
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
