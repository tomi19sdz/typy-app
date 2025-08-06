import random
from backend.utils.football_api import pobierz_mecze_na_jutro

def _generate_detailed_analysis(
    home_team_name: str,
    away_team_name: str,
    selected_typ: str,
    home_form_score: int,
    away_form_score: int,
    home_squad_quality: int,
    away_squad_quality: int,
    home_missing_key_player: bool,
    away_missing_key_player: bool,
    home_recent_opponent_strength_avg: int,
    away_recent_opponent_strength_avg: int,
    prawdopodobienstwo: int
) -> str:
    """
    Generuje szczegółową analizę meczu na podstawie symulowanych danych.
    Analiza ma na celu symulowanie ponad 20 zdań.
    """
    analysis_parts = []

    # Akapit 1: Ogólna ocena i typ
    analysis_parts.append(
        f"Dzisiejsza analiza skupia się na spotkaniu pomiędzy {home_team_name} a {away_team_name}. "
        f"Na podstawie naszych symulacji, najbardziej prawdopodobnym wynikiem jest {selected_typ}, "
        f"z oszacowanym prawdopodobieństwem wynoszącym {prawdopodobienstwo}%. "
        "Jest to typ o wysokiej wartości, biorąc pod uwagę wszystkie dostępne dane, nawet jeśli są one symulowane."
    )

    # Akapit 2: Analiza drużyny gospodarzy
    home_analysis = (
        f"{home_team_name} wchodzi w ten mecz z formą ocenianą na {home_form_score}/10, co świadczy o ich obecnej dyspozycji. "
        f"Jakość składu gospodarzy jest na poziomie {home_squad_quality}/10, co sugeruje solidne podstawy drużyny. "
    )
    if home_missing_key_player:
        home_analysis += "Niestety, {home_team_name} będzie musiał sobie radzić bez kluczowego zawodnika, co może wpłynąć na ich dynamikę w środku pola lub siłę ofensywną. "
        home_analysis += "Brak ten może zmusić trenera do eksperymentowania z ustawieniem lub polegania na mniej doświadczonych graczach. "
    else:
        home_analysis += "{home_team_name} przystępuje do meczu w pełnym składzie, co jest zawsze pozytywnym sygnałem. "
        home_analysis += "Dostępność wszystkich kluczowych graczy pozwala na utrzymanie spójności taktycznej i pełne wykorzystanie potencjału zespołu. "
    home_analysis += (
        f"W ostatnich pięciu meczach {home_team_name} mierzył się z przeciwnikami o średniej sile {home_recent_opponent_strength_avg}/10. "
        "Ich wyniki w tych spotkaniach, w kontekście siły rywali, świadczą o ich prawdziwej wartości i zdolności do radzenia sobie w trudnych warunkach. "
        "Szczegółowa analiza tych pojedynków pokazuje, że drużyna potrafi adaptować się do różnych stylów gry i wyciągać wnioski z popełnionych błędów."
    )
    analysis_parts.append(home_analysis)

    # Akapit 3: Analiza drużyny gości
    away_analysis = (
        f"Z kolei {away_team_name} prezentuje formę na poziomie {away_form_score}/10. "
        f"Ich skład jest oceniany na {away_squad_quality}/10, co oznacza, że mają solidne fundamenty, ale mogą mieć pewne słabe punkty. "
    )
    if away_missing_key_player:
        away_analysis += "Dla {away_team_name} absencja ważnego zawodnika może być znaczącym osłabieniem, szczególnie w fazie przejściowej lub w obronie. "
        away_analysis += "Trener będzie musiał znaleźć skuteczne zastępstwo, aby utrzymać równowagę w zespole. "
    else:
        away_analysis += "{away_team_name} również wystawia najsilniejszy możliwy skład, co gwarantuje im stabilność i przewidywalność. "
        away_analysis += "Pełna dostępność zawodników pozwala na realizację zamierzeń taktycznych bez konieczności improwizacji. "
    away_analysis += (
        f"Ich ostatnie pięć meczów to starcia z rywalami o średniej sile {away_recent_opponent_strength_avg}/10. "
        "Ocena ich formy uwzględnia zarówno zwycięstwa, jak i porażki, dając pełniejszy obraz ich aktualnej siły. "
        "Zwracamy uwagę na to, jak radzili sobie z drużynami o różnym potencjale, co jest kluczowe dla oceny ich wszechstronności."
    )
    analysis_parts.append(away_analysis)

    # Akapit 4: Porównanie i kontekst
    context_analysis = (
        "Biorąc pod uwagę porównanie formy i jakości składów obu drużyn, widzimy, że różnice są znaczące/subtelne (zależnie od symulacji). "
        "Faktor posiadania własnego boiska przez {home_team_name} jest zawsze istotny i może dodać im przewagi psychologicznej. "
        "Jednak {away_team_name} udowodnił, że potrafi zaskoczyć na wyjazdach. "
        "Kluczowe będzie, jak szybko drużyny zaadaptują się do warunków meczowych i czy będą w stanie narzucić swój styl gry od pierwszych minut. "
        "Ostatnie spotkania w tej lidze często charakteryzowały się dużą liczbą bramek/niską liczbą bramek (losowo), co również bierzemy pod uwagę w naszej prognozie."
    )
    analysis_parts.append(context_analysis)

    # Akapit 5: Podsumowanie i wnioski
    conclusion_analysis = (
        "Podsumowując, nasza symulowana analiza wskazuje na wyraźną tendencję w kierunku {selected_typ}. "
        "Wszystkie zebrane i symulowane dane, od formy po potencjalne braki kadrowe, zostały uwzględnione. "
        "Mimo że piłka nożna jest nieprzewidywalna, statystyki i symulowane czynniki sugerują, że ten typ ma solidne podstawy. "
        "Zalecamy jednak zawsze podchodzić do typów z rozwagą i brać pod uwagę inne czynniki, które mogą pojawić się tuż przed meczem. "
        "Jesteśmy pewni, że to spotkanie dostarczy wielu emocji, a nasz typ jest oparty na najbardziej prawdopodobnym scenariuszu."
    )
    analysis_parts.append(conclusion_analysis)

    return "\n\n".join(analysis_parts)


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
        home_form_score = random.randint(3, 10) # Szerszy zakres
        away_form_score = random.randint(3, 10)

        # Symulacja braków ważnych piłkarzy (True/False)
        home_missing_key_player = random.choice([True] + [False]*4) # 20% szans na brak
        away_missing_key_player = random.choice([True] + [False]*4)

        # Symulacja średniej siły przeciwników w ostatnich 5 meczach (0-10, gdzie 10 to silny przeciwnik)
        home_recent_opponent_strength_avg = random.randint(4, 9)
        away_recent_opponent_strength_avg = random.randint(4, 9)

        # Symulacja jakości składu (0-10)
        home_squad_quality = random.randint(5, 10)
        away_squad_quality = random.randint(5, 10)

        # Obliczanie bazowego prawdopodobieństwa
        prob_home_win = 0.35
        prob_draw = 0.30
        prob_away_win = 0.35

        # Wpływ formy (zwiększony)
        prob_home_win += (home_form_score - away_form_score) * 0.03
        prob_away_win += (away_form_score - home_form_score) * 0.03

        # Wpływ jakości składu (zwiększony)
        prob_home_win += (home_squad_quality - away_squad_quality) * 0.03
        prob_away_win += (away_squad_quality - home_squad_quality) * 0.03

        # Wpływ braków ważnych piłkarzy (zwiększony)
        if home_missing_key_player:
            prob_home_win -= 0.15
            prob_away_win += 0.07
        if away_missing_key_player:
            prob_away_win -= 0.15
            prob_home_win += 0.07
        
        # Wpływ siły przeciwników (jeśli forma jest dobra mimo silnych przeciwników, to plus)
        # Jeśli forma jest słaba mimo słabych przeciwników, to minus
        if home_form_score > 7 and home_recent_opponent_strength_avg > 7:
            prob_home_win += 0.05
        elif home_form_score < 5 and home_recent_opponent_strength_avg < 5:
            prob_home_win -= 0.05

        if away_form_score > 7 and away_recent_opponent_strength_avg > 7:
            prob_away_win += 0.05
        elif away_form_score < 5 and away_recent_opponent_strength_avg < 5:
            prob_away_win -= 0.05

        # Normalizacja prawdopodobieństw, aby suma wynosiła 100%
        # Upewniamy się, że żadne prawdopodobieństwo nie jest ujemne
        prob_home_win = max(0.01, prob_home_win)
        prob_draw = max(0.01, prob_draw)
        prob_away_win = max(0.01, prob_away_win)

        total_prob = prob_home_win + prob_draw + prob_away_win
        prob_home_win = round((prob_home_win / total_prob) * 100)
        prob_draw = round((prob_draw / total_prob) * 100)
        prob_away_win = round((prob_away_win / total_prob) * 100)

        # Wybór typu z prawdopodobieństwem powyżej 60%
        selected_typ = None
        prawdopodobienstwo = 0
        analiza = ""
        kurs = 0.0

        # Priorytetyzacja typów 1 i 2, a następnie X, jeśli spełniają warunek > 60%
        if prob_home_win > 60:
            selected_typ = "1"
            prawdopodobienstwo = prob_home_win
            kurs = round(random.uniform(1.40, 2.00), 2) # Niższy kurs dla wyższego prawdopodobieństwa
            analiza = _generate_detailed_analysis(
                home_team["name"], away_team["name"], selected_typ,
                home_form_score, away_form_score, home_squad_quality, away_squad_quality,
                home_missing_key_player, away_missing_key_player,
                home_recent_opponent_strength_avg, away_recent_opponent_strength_avg,
                prawdopodobienstwo
            )
        elif prob_away_win > 60:
            selected_typ = "2"
            prawdopodobienstwo = prob_away_win
            kurs = round(random.uniform(1.80, 2.80), 2) # Wyższy kurs dla wyższego prawdopodobieństwa na wyjeździe
            analiza = _generate_detailed_analysis(
                home_team["name"], away_team["name"], selected_typ,
                home_form_score, away_form_score, home_squad_quality, away_squad_quality,
                home_missing_key_player, away_missing_key_player,
                home_recent_opponent_strength_avg, away_recent_opponent_strength_avg,
                prawdopodobienstwo
            )
        elif prob_draw > 60:
            selected_typ = "X"
            prawdopodobienstwo = prob_draw
            kurs = round(random.uniform(2.80, 4.00), 2) # Kurs na remis zazwyczaj wyższy
            analiza = _generate_detailed_analysis(
                home_team["name"], away_team["name"], selected_typ,
                home_form_score, away_form_score, home_squad_quality, away_squad_quality,
                home_missing_key_player, away_missing_key_player,
                home_recent_opponent_strength_avg, away_recent_opponent_strength_avg,
                prawdopodobienstwo
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
