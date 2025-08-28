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
  const today = new Date().toISOString().split('T')[0];
  const apiUrl = `https://v3.football.api-sports.io/fixtures?date=${today}&league=${leagueIds.join(',')}`;

  // Krok 1: Sprawdzenie, czy klucz API istnieje.
  console.log('Sprawdzam klucz API. Wartość:', apiKey ? 'Istnieje' : 'Brak');
  
  if (!apiKey) {
    console.error('Błąd: Klucz API nie został znaleziony. Sprawdź zmienne środowiskowe na Vercelu.');
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // Krok 2: Wywołanie API z poprawnymi nagłówkami.
    console.log('Wywołuję API z URL-em:', apiUrl);
    const res = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      cache: 'no-store'
    });

    // Krok 3: Sprawdzenie odpowiedzi z API.
    console.log('Odpowiedź API - Status:', res.status, 'StatusText:', res.statusText);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('API zwróciło błąd:', errorData);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    // Krok 4: Przetworzenie odpowiedzi i sprawdzenie danych.
    const data = await res.json();
    console.log('Otrzymano surowe dane z API:', JSON.stringify(data));
    
    // Upewniamy się, że odpowiedź zawiera tablicę 'response'.
    if (!data || !data.response || !Array.isArray(data.response)) {
      console.error('API zwróciło nieoczekiwane dane lub puste pole "response".');
      // Zwracamy pustą tablicę, aby uniknąć błędów na frontendzie
      return NextResponse.json([], { status: 200 }); 
    }

    // Krok 5: Zwrócenie danych.
    console.log(`Pomyślnie pobrano ${data.response.length} meczów.`);
    return NextResponse.json(data.response, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) {
    // Krok 6: Obsługa błędów sieciowych.
    console.error('Wewnętrzny błąd serwera:', error);
    let errorMessage = 'Wystąpił nieznany błąd';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
