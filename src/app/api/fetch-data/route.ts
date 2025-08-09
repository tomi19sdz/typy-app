// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; // Użyj zmiennej środowiskowej
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?date=2024-05-15', {
      headers: {
        'x-rapidapi-key': "8dfc23b74ee7404e7ee7ab29d91532c2",
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: res.status });
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