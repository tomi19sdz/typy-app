from .football_api import pobierz_mecze_na_jutro

def generuj_typy_na_jutro():
    mecze = pobierz_mecze_na_jutro()
    typy = []

    for mecz in mecze:
        if mecz["prawdopodobienstwo"] >= 60:
            typy.append(mecz)

    return typy
