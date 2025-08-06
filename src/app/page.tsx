'use client';

import { useEffect, useState } from 'react';

// Definicja typu dla danych meczu
type Typ = {
  id: number; // Dodano ID dla unikalnego klucza
  data: string;
  gospodarz: string;
  gosc: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string;
};

export default function HomePage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null); // Nowy stan na czas generowania

  useEffect(() => {
    const fetchTypy = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/typy';
        console.log('Attempting to fetch from:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json(); // Oczekujemy teraz { tips: [...], generated_at_utc: "..." }

        if (data && Array.isArray(data.tips)) {
          // Filtrujemy typy z prawdopodobieństwem powyżej 60% dla strony głównej
          const filteredTypy = data.tips.filter((typ: Typ) => typ.prawdopodobienstwo > 60);
          setTypy(filteredTypy);
          setGeneratedAt(data.generated_at_utc); // Ustaw czas generowania
        } else {
          console.error("API returned data in unexpected format:", data);
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

  const formatGeneratedTime = (isoString: string | null) => {
    if (!isoString) return 'Brak danych';
    try {
      const date = new Date(isoString);
      // Formatowanie daty i czasu do czytelnego formatu lokalnego
      return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'shortOffset' // np. "CEST"
      });
    } catch (e) {
      console.error("Błąd formatowania daty:", e);
      return isoString; // Zwróć surowy string, jeśli formatowanie się nie powiedzie
    }
  };

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie typów...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Typy na Jutro</h1>

      {typy.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak typów na jutro (prawdopodobieństwo &gt; 60%).</p>
      ) : (
        <div className="space-y-4">
          {typy.map((mecz) => (
            <div
              key={mecz.id}
              className="bg-gray-800 p-4 rounded-md shadow-md border-l-4"
              style={{
                borderColor:
                  mecz.prawdopodobienstwo >= 70
                    ? 'green'
                    : mecz.prawdopodobienstwo >= 60
                    ? 'orange'
                    : 'red'
              }}
            >
              <h2 className="text-xl font-semibold">
                {mecz.gospodarz} vs {mecz.gosc}
              </h2>
              <p className="text-sm text-gray-400">{mecz.data}</p>
              <p className="mt-2">
                <strong>Typ:</strong> {mecz.typ} | <strong>Kurs:</strong> {mecz.kurs} |{' '}
                <strong>Szansa:</strong> {mecz.prawdopodobienstwo}%
              </p>
              <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{mecz.analiza}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Informacja o czasie generowania na samym dole strony */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Typy wygenerowano: {formatGeneratedTime(generatedAt)}</p>
      </div>
    </div>
  );
}
