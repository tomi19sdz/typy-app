import random
from backend.utils.football_api import pobierz_mecze_na_jutro

def generuj_typy_na_jutro():
    """
    Generuje typy na jutro na podstawie pobranych meczów,
    dodając bardziej zróżnicowane typy, kursy i analizy,
    symulując zaawansowane czynniki analityczne.
    """
    mecze = pobierz_mecze_na_jutro()
    typy = []

    for fixture in mecze:
        home_team = fixture["teams"]["home"]
        away_team = fixture["teams"]["away"]
        league = fixture["league"]
        date = fixture["fixture"]["date"]
        fixture_id = fixture["fixture"]["id"]

        # Symulacja czynników analitycznych (ponieważ API nie dostarcza ich wprost)
        # W PRAWDZIWEJ APLIKACJI TE DANE MUSIAŁYBY BYĆ POBIERANE Z API LUB BAZY DANYCH
        
        # Symulacja formy w ostatnich 5 meczach (0-10, gdzie 10 to najlepsza forma)
        home_form_score = random.randint(4, 10) # Domyślnie lekko lepsza forma
        away_form_score = random.randint(4, 10)

        # Symulacja braków ważnych piłkarzy (True/False)
        home_missing_key_player = random.choice([True, False, False]) # Rzadziej brakuje
        away_missing_key_player = random.choice([True, False, False])

        # Symulacja siły przeciwników w ostatnich meczach (0-10, gdzie 10 to silny przeciwnik)
        home_opponent_strength = random.randint(3, 9)
        away_opponent_strength = random.randint(3, 9)

        # Symulacja jakości składu (0-10)
        home_squad_quality = random.randint(5, 10)
        away_squad_quality = random.randint(5, 10)

        # Obliczanie prawdopodobieństwa na podstawie symulowanych czynników
        # Bardziej złożona formuła, która uwzględnia symulowane dane
        # Wpływ: forma, jakość składu, braki, siła przeciwnika (im silniejszy przeciwnik, tym trudniej o wygraną)
        
        # Bazowe prawdopodobieństwo
        prob_home_win = 0.33
        prob_draw = 0.33
        prob_away_win = 0.33

        # Wpływ formy
        prob_home_win += (home_form_score - away_form_score) * 0.02
        prob_away_win += (away_form_score - home_form_score) * 0.02

        # Wpływ jakości składu
        prob_home_win += (home_squad_quality - away_squad_quality) * 0.02
        prob_away_win += (away_squad_quality - home_squad_quality) * 0.02

        # Wpływ braków ważnych piłkarzy
        if home_missing_key_player:
            prob_home_win -= 0.10
            prob_away_win += 0.05
        if away_missing_key_player:
            prob_away_win -= 0.10
            prob_home_win += 0.05
        
        # Wpływ siły przeciwników (im silniejszy przeciwnik, tym trudniej o wygraną, ale wygrana z nim świadczy o sile)
        # Tutaj uproszczona logika: im silniejszy przeciwnik, tym trudniej o typ 1/2, a łatwiej o X
        prob_home_win -= home_opponent_strength * 0.005
        prob_away_win -= away_opponent_strength * 0.005
        prob_draw += (home_opponent_strength + away_opponent_strength) * 0.005


        # Normalizacja prawdopodobieństw, aby suma wynosiła 100%
        total_prob = prob_home_win + prob_draw + prob_away_win
        prob_home_win = round((prob_home_win / total_prob) * 100)
        prob_draw = round((prob_draw / total_prob) * 100)
        prob_away_win = round((prob_away_win / total_prob) * 100)

        # Wybór typu z prawdopodobieństwem powyżej 60%
        selected_typ = None
        prawdopodobienstwo = 0
        analiza = ""
        kurs = 0.0

        if prob_home_win > 60:
            selected_typ = "1"
            prawdopodobienstwo = prob_home_win
            kurs = round(random.uniform(1.40, 2.00), 2) # Niższy kurs dla wyższego prawdopodobieństwa
            analiza = (
                f"Analiza: {home_team['name']} ma bardzo dobrą formę ({home_form_score}/10) i silny skład ({home_squad_quality}/10). "
                f"Brak ważnych graczy: {'Tak' if home_missing_key_player else 'Nie'}. "
                f"{away_team['name']} ma słabszą formę ({away_form_score}/10) i trudnych przeciwników ({away_opponent_strength}/10) w ostatnich meczach. "
                f"Wysokie prawdopodobieństwo wygranej {home_team['name']}."
            )
        elif prob_away_win > 60:
            selected_typ = "2"
            prawdopodobienstwo = prob_away_win
            kurs = round(random.uniform(1.80, 2.80), 2) # Wyższy kurs dla wyższego prawdopodobieństwa na wyjeździe
            analiza = (
                f"Analiza: {away_team['name']} jest w świetnej formie ({away_form_score}/10) i ma solidny skład ({away_squad_quality}/10). "
                f"Brak ważnych graczy: {'Tak' if away_missing_key_player else 'Nie'}. "
                f"{home_team['name']} ma gorszą formę ({home_form_score}/10) i mierzył się z silnymi przeciwnikami ({home_opponent_strength}/10). "
                f"Wysokie prawdopodobieństwo wygranej {away_team['name']}."
            )
        elif prob_draw > 60: # Możesz zdecydować, czy chcesz typować remisy z wysokim prawdopodobieństwem
            selected_typ = "X"
            prawdopodobienstwo = prob_draw
            kurs = round(random.uniform(2.80, 4.00), 2) # Kurs na remis zazwyczaj wyższy
            analiza = (
                f"Analiza: Mecz pomiędzy {home_team['name']} a {away_team['name']} zapowiada się na bardzo wyrównany. "
                f"Obie drużyny prezentują podobną formę ({home_form_score}/{away_form_score}/10) i jakość składu. "
                f"Brak ważnych graczy: {'Tak' if home_missing_key_player else 'Nie'} dla gospodarzy, {'Tak' if away_missing_key_player else 'Nie'} dla gości. "
                f"Duże prawdopodobieństwo remisu."
            )
        
        # Jeśli żaden typ nie spełnia kryterium > 60%, ten mecz nie zostanie dodany
        if selected_typ:
            typ = {
                "id": fixture_id,
                "data": date[:10],
                "gospodarz": home_team["name"],
                "gosc": away_team["name"],
                "typ": selected_typ,
                "kurs": kurs,
                "prawdopodobienstwo": prawdopodobienstwo,
                "analiza": analiza
            }
            typy.append(typ)
    return typy

