// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  // Poniższa tablica zawiera ID lig do pobrania z API.
  // Możesz dodawać lub usuwać ID, aby dostosować widoczne ligi.
  const leagueIds = [
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
    '61',
    // UEFA Champions League
    '2',
    // UEFA Europa League
    '3',
    // UEFA Europa Conference League
    '848'
  ];
  const today = new Date().toISOString().split('T')[0];

  if (!apiKey) {
    console.error('API key not found');
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // API-Sports pozwala na wyszukiwanie meczów po dacie i ID ligi
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&league=${leagueIds.join(',')}`, {
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
    
    if (!data || !data.response) {
      console.error('API zwróciło nieoczekiwane dane:', data);
      return NextResponse.json({ error: 'Unexpected data format from API' }, { status: 500 });
    }
    
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
