// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const newApiKey = "1";
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
    '4337'
  ];

  try {
    const fetchPromises = leagueIds.map(async (id) => {
      const newApiUrl = `https://www.thesportsdb.com/api/v1/json/${newApiKey}/eventsnextleague.php?id=${id}`;
      console.log(`Pobieram dane dla ligi o ID: ${id}`);
      const res = await fetch(newApiUrl, {
        cache: 'no-store'
      });

      if (!res.ok) {
        console.error(`Błąd z API dla ligi ${id}. Status:`, res.status, 'StatusText:', res.statusText);
        return { events: [] }; // Zwracamy pustą tablicę, aby nie zatrzymać wszystkich zapytań
      }
      
      const data = await res.json();
      console.log(`Pobrano dane dla ligi o ID: ${id}`);
      return data;
    });

    // Czekamy, aż wszystkie zapytania zostaną zakończone
    const results = await Promise.all(fetchPromises);

    const allEvents = results.flatMap(result => result.events || []);

    if (allEvents.length === 0) {
      console.error('Brak danych dla wszystkich lig.');
      return NextResponse.json({ error: 'Brak dostępnych meczów dla wszystkich wybranych lig.' }, { status: 500 });
    }

    // Zwracamy wszystkie dane.
    return NextResponse.json(allEvents, {
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
