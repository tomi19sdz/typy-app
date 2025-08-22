// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';

interface FootballEvent {
  idEvent: string;
  idLeague: string;
  strEvent: string;
  dateEvent: string;
  [key: string]: unknown; // pozwala na dodatkowe pola bez użycia "any"
}

export async function GET() {
  const apiKey = "1"; // darmowy klucz TheSportsDB
  const leagueIds = [
    '4328', // Premier League
    '4332', // Ekstraklasa
    '4335', // La Liga
    '4331', // Bundesliga
    '4337', // Serie A
    '4334'  // Ligue 1
  ];

  try {
    const allEvents: FootballEvent[] = [];

    // pobieramy wydarzenia dla każdej ligi osobno
    for (const id of leagueIds) {
      const url = `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnextleague.php?id=${id}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        console.error(`Błąd API dla ligi ${id}:`, res.status, res.statusText);
        continue;
      }

      const data = await res.json();

      if (data && Array.isArray(data.events)) {
        allEvents.push(...data.events);
      }
    }

    if (allEvents.length === 0) {
      return NextResponse.json(
        { error: 'Brak dostępnych meczów w wybranych ligach.', events: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(allEvents, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Wewnętrzny błąd serwera:', error.message);
      return NextResponse.json(
        { error: 'Internal server error', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Wewnętrzny błąd serwera: Nieznany błąd');
      return NextResponse.json(
        { error: 'Internal server error', details: 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
