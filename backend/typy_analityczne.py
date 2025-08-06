# ZMIEŃ TĘ LINIĘ: Importuj bezpośrednio z podkatalogu 'utils'
from utils.football_api import pobierz_mecze_na_jutro

def generuj_typy_na_jutro():
    """
    Generuje typy na jutro na podstawie pobranych meczów.
    """
    mecze = pobierz_mecze_na_jutro()
    typy = []
    for fixture in mecze:
        home = fixture["teams"]["home"]
        away = fixture["teams"]["away"]
        league = fixture["league"]
        date = fixture["fixture"]["date"]
        # Przykład prostej logiki (rozbudujemy później)
        if home["winner"] is None and away["winner"] is None:
            analiza = f"{home['name']} w dobrej formie, grają u siebie. {away['name']} nie wygrał ostatnich meczów."
            typ = {
                "data": date[:10],
                "gospodarz": home["name"],
                "gosc": away["name"],
                "typ": "1",
                "kurs": 1.80,
                "prawdopodobienstwo": 65,
                "analiza": analiza
            }
            typy.append(typ)
    return typy
