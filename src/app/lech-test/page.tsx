'use client';

import { useEffect, useState } from 'react';

// Zaktualizowany typ, aby pasował do danych z TheSportsDB
type Typ = {
  id: string; // ID wydarzenia
  strEvent: string; // Nazwa meczu, np. "Lech Poznań vs Cracovia"
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
  strLeague: string;
};

export default function LechTestPage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLechTypy = async () => {
      try {
        setLoading(true);
        // Używamy nowego API: TheSportsDB
        // ID zespołu Lech Poznań w TheSportsDB to 134010
        const teamId = '134010';
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/60130162/eventsnext.php?id=${teamId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd HTTP! Status: ${response.status}, Wiadomość: ${errorText}`);
        }

        const data = await response.json();
        // TheSportsDB zwraca dane w polu 'events'
        if (data && Array.isArray(data.events)) {
          setTypy(data.events);
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
      <h1 className="text-3xl font-bold mb-8 text-center">Test dla Lecha Poznań (nadchodzące mecze)</h1>
      {loading ? (
        <p>Ładowanie danych...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : typy.length > 0 ? (
        <div className="space-y-4 w-full max-w-2xl">
          {typy.map((mecz) => (
            <div
              key={mecz.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500"
            >
              <h2 className="text-xl font-semibold">{mecz.strEvent}</h2>
              <p>Liga: {mecz.strLeague}</p>
              <p>Data: {mecz.dateEvent}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">Brak nadchodzących meczów Lecha Poznań.</p>
      )}
    </div>
  );
}
