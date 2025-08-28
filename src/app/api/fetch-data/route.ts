// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  const leagueIds = [
    // UEFA Champions League
    '2',
    // UEFA Europa League
    '3',
    // UEFA Europa Conference League
    '848',
    // English Premier League
    '39',
    // Polish Ekstraklasa
    '106', 
    // Spanish La Liga
    '140',
    // German Bundesliga
    '78',
    // Italian Serie A
    '135',
    // French Ligue 1
    '61'
  ];
  // Zmieniamy datę na 2024-05-25, aby mieć pewność, że są mecze
  const apiUrl = `https://v3.football.api-sports.io/fixtures?date=2024-05-25&league=${leagueIds.join(',')}`;

  // Logowanie URL-a, aby sprawdzić, czy jest poprawny
  console.log('Pobieram dane z URL-a:', apiUrl);
  
  if (!apiKey) {
    console.error('Błąd: Klucz API nie został znaleziony. Sprawdź zmienne środowiskowe na Vercelu.');
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Błąd z API. Status:', res.status, 'StatusText:', res.statusText);
      const errorData = await res.json().catch(() => null);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    const data = await res.json();
    
    if (!data || !data.response || !Array.isArray(data.response)) {
      console.error('API zwróciło nieoczekiwane dane lub puste pole "response".');
      return NextResponse.json([], { status: 200 }); 
    }

    console.log(`Pomyślnie pobrano ${data.response.length} meczów.`);
    return NextResponse.json(data.response, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) {
    console.error('Wewnętrzny błąd serwera:', error);
    let errorMessage = 'Wystąpił nieznany błąd';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
