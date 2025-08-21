// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  
  // To powinno pojawić się w logach Vercela
  console.log('Wartość klucza API w serwerze:', apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // Zmieniono datę na konkretną, aby sprawdzić, czy API zwraca dane
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=2025-08-21`, {
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

    // Ostateczna poprawka: zwracamy dane bezpośrednio,
    // a Vercel zajmie się cachowaniem za nas dzięki nagłówkom.
    return NextResponse.json(data.response, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) { // Zmieniono z `any` na `unknown`
    // Sprawdzamy, czy błąd jest instancją Error, aby uzyskać dostęp do message
    if (error instanceof Error) {
        console.error('Wewnętrzny błąd serwera:', error.message);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
        console.error('Wewnętrzny błąd serwera:', 'Nieznany błąd');
        return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
    }
  }
}
