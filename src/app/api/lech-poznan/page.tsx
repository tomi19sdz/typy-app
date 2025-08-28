'use client';

import { useEffect, useState } from 'react';

// Typ pasujący do odpowiedzi z API-Sports
type Typ = {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
    };
  };
  league: {
    name: string;
  };
  teams: {
    home: {
      name: string;
    };
    away: {
      name: string;
    };
  };
};

export default function LechTestPage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLechTypy = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lech-poznan');

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd HTTP! Status: ${response.status}, Wiadomość: ${errorText}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setTypy(data);
        } else {
          setError("Otrzymano nieprawidłowy format danych z serwera.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Błąd ładowania danych: ${err.message}`);
        } else {
          setError("Wystąpił nieznany błąd podczas ładowania danych.");
        }
        console.error("Błąd podczas pobierania danych:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLechTypy();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Test dla Lecha Poznań (dzisiejsze mecze)</h1>
      {loading ? (
        <p>Ładowanie danych...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : typy.length > 0 ? (
        <div className="space-y-4 w-full max-w-2xl">
          {typy.map((mecz) => (
            <div
              key={mecz.fixture.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-semibold">{mecz.teams.home.name} vs {mecz.teams.away.name}</h2>
              <p>Data: {mecz.fixture.date.split('T')[0]}</p>
              <p>Liga: {mecz.league.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">Brak dzisiejszych meczów Lecha Poznań.</p>
      )}
    </div>
  );
}
