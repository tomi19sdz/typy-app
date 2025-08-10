// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  // Pobieramy klucz API ze zmiennych środowiskowych Vercela,
  // używając składni Next.js, aby zapewnić kompatybilność.
  const apiKey = process.env.FOOTBALL_API_KEY; 
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?date=2024-05-15', {
      headers: {
        // Używamy zmiennej apiKey do ustawienia nagłówka.
        'x-rapidapi-key': "8dfc23b74ee7404e7ee7ab29d91532c2",
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      // Jeśli odpowiedź nie jest OK, zwracamy błąd z odpowiednim statusem.
      const errorData = await res.json();
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    const data = await res.json();
    
    // Zapisz dane do pliku w folderze public
    const filePath = path.join(process.cwd(), 'public', 'cached-data.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({ message: 'Data fetched and cached successfully' });

  } catch (error) {
    console.error('Error fetching and caching data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
