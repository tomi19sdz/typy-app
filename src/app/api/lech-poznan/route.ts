// src/app/api/lech-poznan/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  const today = new Date().toISOString().split('T')[0];
  
  // ID zespołu Lech Poznan w API-Sports to 2000
  const teamId = '2000';
  const apiUrl = `https://v3.football.api-sports.io/fixtures?team=${teamId}&date=${today}`;

  console.log(`Testuję API dla Lecha Poznan. URL: ${apiUrl}`);

  if (!apiKey) {
    console.error('Błąd: Klucz API nie został znaleziony.');
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

    console.log(`Pomyślnie pobrano ${data.response.length} meczów dla Lecha Poznan.`);
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
