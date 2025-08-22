// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

interface FootballEvent {
  idLeague: string;
  [key: string]: any; // Allows for additional properties
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
      console.error('API returned unexpected data:', data);
      return NextResponse.json({ error: 'No available matches for selected leagues.' }, { status: 500 });
    }

    // Filter matches by League ID
    const filteredEvents = data.events.filter((event: FootballEvent) => leagueIds.includes(event.idLeague));

    if (filteredEvents.length === 0) {
      console.error('No data for all leagues after filtering.');
      return NextResponse.json({ error: 'No available matches for selected leagues.' }, { status: 500 });
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
