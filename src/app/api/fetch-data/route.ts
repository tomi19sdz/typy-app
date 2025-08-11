// src/app/api/fetch-data/route.ts
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY; 
  
  console.log('Wartość klucza API w serwerze:', apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?date=2024-05-15', {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error('Błąd z API. Status:', res.status, 'StatusText:', res.statusText);
      const errorData = await res.json().catch(() => null); // Upewniamy się, że to nie zawiesza kodu
      return NextResponse.json({ error: 'Failed to fetch data from API', apiError: errorData }, { status: res.status });
    }

    const data = await res.json();
    
    // Upewniamy się, że dane są w odpowiednim formacie
    if (!data || !data.response) {
      console.error('API zwróciło nieoczekiwane dane:', data);
      return NextResponse.json({ error: 'Unexpected data format from API' }, { status: 500 });
    }

    // Zapisz dane do pliku w folderze public
    const filePath = path.join(process.cwd(), 'public', 'cached-data.json');
    await fs.writeFile(filePath, JSON.stringify(data.response, null, 2));

    return NextResponse.json({ message: 'Data fetched and cached successfully' });

  } catch (error) {
    console.error('Wewnętrzny błąd serwera:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
