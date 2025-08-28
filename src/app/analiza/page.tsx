'use client';

import { useEffect, useState } from 'react';

type Typ = {
  id: string; // Używamy 'string', ponieważ ID w TheSportsDB to string.
  strEvent: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent: string;
};

export default function AnalizaPage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypy = async () => {
      try {
        setLoading(true);
        // Zmieniono apiUrl na bezpośredni URL do TheSportsDB,
        // ponieważ API Route miało błędną konfigurację.
        // Używamy ID zespołu Lech Poznań (134010)
        const teamId = '134010';
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${teamId}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
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

    fetchTypy();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie analiz...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }
  
  // Zaktualizowano rendering, aby pokazać dane z TheSportsDB
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Szczegółowe Analizy Typów</h1>
      {typy.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak typów do wyświetlenia.</p>
      ) : (
        <div className="space-y-8 w-full max-w-2xl">
          {typy.map((mecz) => (
            <div
              key={mecz.id}
              className="bg-gray-800 p-6 rounded-lg shadow-xl border-l-4 border-green-500"
            >
              <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                {mecz.strHomeTeam} vs {mecz.strAwayTeam} ({mecz.dateEvent})
              </h2>
              <p className="text-lg mb-4">
                <strong>Liga:</strong> <span className="text-yellow-300">{mecz.strLeague}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
