// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  
  console.log('Wartość klucza API w serwerze:', apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?date=2024-05-15', {
      headers: {
        // Poprawne użycie klucza API z zmiennej środowiskowej
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

    // Zwracamy dane z nagłówkiem Cache-Control.
    // To poinstruuje Vercel, aby przechowywał odpowiedź w pamięci podręcznej przez 3600 sekund (1 godzina).
    // W ten sposób, następne wywołania tego endpointu przez 1 godzinę nie będą obciążać API-Sports.
    return NextResponse.json(data.response, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error) {
    console.error('Wewnętrzny błąd serwera:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
