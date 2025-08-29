// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  
  // Wartość klucza API w serwerze:
  console.log('Wartość klucza API w serwerze:', apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    // Używamy tego samego URL, który podałeś
    const res = await fetch('https://www.thesportsdb.com/api/v1/json/123/lookupleague.php?id=4328', {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Błąd z API. Status:', res.status, 'StatusText:', res.statusText);
      const errorData = await res.json().catch(() => null);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    const data = await res.json();
    
    // Zmieniono warunek sprawdzający na 'leagues', a nie 'events'
    if (!data || !data.leagues || data.leagues.length === 0) {
      console.error('API zwróciło nieoczekiwane dane lub brak lig:', data);
      return NextResponse.json({ error: 'Unexpected data format or no leagues found' }, { status: 500 });
    }

    // Zwracamy dane, które pasują do struktury
    return NextResponse.json(data.leagues, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) { // Zmieniono 'any' na 'unknown'
    let errorMessage = "Wystąpił nieznany błąd serwera.";
    if (error instanceof Error) {
        errorMessage = `Wewnętrzny błąd serwera: ${error.message}`;
    }
    console.error(errorMessage);
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
