// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  // Nowy klucz API
  const newApiKey = "1";
  const newApiUrl = `https://www.thesportsdb.com/api/v1/json/${newApiKey}/eventsnextleague.php?id=4328`; // Poprawiony endpoint

  try {
    // Zmieniono datę na konkretną, aby sprawdzić, czy API zwraca dane
    const res = await fetch(newApiUrl, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Błąd z API. Status:', res.status, 'StatusText:', res.statusText);
      const errorData = await res.json().catch(()co => null);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    const data = await res.json();
    
    // Sprawdzamy, czy dane istnieją w kluczu `events`
    if (!data || !data.events) {
      console.error('API zwróciło nieoczekiwane dane:', data);
      return NextResponse.json({ error: 'Unexpected data format from API' }, { status: 500 });
    }

    // Zwracamy dane bezpośrednio.
    return NextResponse.json(data.events, {
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
