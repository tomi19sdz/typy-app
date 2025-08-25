// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

interface FootballEvent {
  idLeague: string;
  // Usunięto [key: string]: any; aby spełnić wymagania ESLint
  strEvent: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
}

export async function GET() {
  const newApiKey = "1";
  const today = new Date().toISOString().split('T')[0];
  const newApiUrl = `https://www.thesportsdb.com/api/v1/json/${newApiKey}/eventsday.php?d=${today}&s=Soccer`;

  const leagueIds = [
    // English Premier League
    '4328', 
    // Polish Ekstraklasa
    '4332', 
    // Spanish La Liga
    '4335',
    // German Bundesliga
    '4331',
    // Italian Serie A
    '4337',
    // French Ligue 1
    '4334'
  ];

  try {
    const res = await fetch(newApiUrl, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`API Error. Status:`, res.status, 'StatusText:', res.statusText);
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: null }, { status: res.status });
    }
    
    const data = await res.json();

    if (!data || !Array.isArray(data.events) || data.events.length === 0) {
      console.error('API returned unexpected data or no events.');
      // Zwróć pustą tablicę zamiast błędu, aby strona wyświetliła "Brak typów do wyświetlenia".
      return NextResponse.json([], { status: 200 });
    }

    // Filter matches by League ID
    const filteredEvents = data.events.filter((event: FootballEvent) => leagueIds.includes(event.idLeague));

    if (filteredEvents.length === 0) {
      console.error('No data for all leagues after filtering.');
      // Zwróć pustą tablicę, gdy nie ma meczów dla wybranych lig.
      return NextResponse.json([], { status: 200 });
    }

    // Return all data
    return NextResponse.json(filteredEvents, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
        console.error('Internal server error:', error.message);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } else {
        console.error('Internal server error:', 'Unknown error');
        return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
    }
  }
}
