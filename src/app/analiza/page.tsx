'use client';

import { useEffect, useState } from 'react';

// Zaktualizowany typ, aby pasował do danych z API-Sports
type Typ = {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

export default function AnalizaPage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypy = async () => {
      try {
        const apiUrl = '/api/fetch-data';
        console.log('Attempting to fetch from:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          // Brak logiki filtrowania typów. Pokażemy wszystkie.
          setTypy(data);
        } else {
          console.error("API returned data that is not an array:", data);
          setError("Otrzymano nieprawidłowy format danych z serwera.");
        }
      } catch (err: unknown) {
        console.error("Błąd podczas pobierania typów:", err);
        if (err instanceof Error) {
          setError(`Błąd ładowania typów: ${err.message}`);
        } else {
          setError("Wystąpił nieznany błąd podczas ładowania typów.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTypy();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie analiz...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }
  
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6 text-center">Szczegółowe Analizy Typów</h1>
      {typy.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak typów do wyświetlenia.</p>
      ) : (
        <div className="space-y-8">
          {typy.map((mecz) => (
            <div
              key={mecz.fixture.id}
              className="bg-gray-800 p-6 rounded-lg shadow-xl border-l-4 border-green-500"
            >
              <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                {mecz.teams.home.name} vs {mecz.teams.away.name} ({mecz.fixture.date.split('T')[0]})
              </h2>
              <p className="text-lg mb-4">
                <strong>Liga:</strong> <span className="text-yellow-300">{mecz.league.name}</span>
              </p>
              <p className="text-lg mb-4">
                <strong>Wynik:</strong>{' '}
                <span className="text-yellow-300">
                  {mecz.goals.home ?? '-'} : {mecz.goals.away ?? '-'}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
