// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

interface FootballEvent {
  idLeague: string;
  // Możesz dodać więcej właściwości, które Cię interesują
  // np. strEvent: string;
  // data: any;
}

export async function GET() {
  const newApiKey = "1";
  const today = new Date().toISOString().split('T')[0];
  const newApiUrl = `https://www.thesportsdb.com/api/v1/json/${newApiKey}/eventsday.php?d=${today}&s=Soccer`;

  const leagueIds = [
    // Angielska Premier League
    '4328', 
    // Polska Ekstraklasa
    '4332', 
    // Hiszpańska La Liga
    '4335',
    // Niemiecka Bundesliga
    '4331',
    // Włoska Serie A
    '4337',
    // Francuska Ligue 1
    '4334'
  ];

  try {
    const res = await fetch(newApiUrl, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`Błąd z API. Status:`, res.status, 'StatusText:', res.statusText);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: null }, { status: res.status });
    }
    
    const data = await res.json();

    if (!data || !data.events) {
      console.error('API zwróciło nieoczekiwane dane:', data);
      return NextResponse.json({ error: 'Brak dostępnych meczów dla wszystkich wybranych lig.' }, { status: 500 });
    }

    // Filtrujemy mecze według ID lig
    const filteredEvents = data.events.filter((event: FootballEvent) => leagueIds.includes(event.idLeague));

    if (filteredEvents.length === 0) {
      console.error('Brak danych dla wszystkich lig po filtrowaniu.');
      return NextResponse.json({ error: 'Brak dostępnych meczów dla wszystkich wybranych lig.' }, { status: 500 });
    }

    // Zwracamy wszystkie dane.
    return NextResponse.json(filteredEvents, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Wewnętrzny błąd serwera:', error.message);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
        console.error('Wewnętrzny błąd serwera:', 'Nieznany błąd');
        return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
    }
  }
}
