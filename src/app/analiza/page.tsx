'use client';

import { useEffect, useState } from 'react';

type Typ = {
  id: number; // Dodano ID dla unikalnego klucza
  data: string;
  gospodarz: string;
  gosc: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string; // Teraz to będzie długa analiza
};

export default function AnalizaPage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const data = await response.json();

        if (Array.isArray(data)) {
          // Filtrujemy typy z prawdopodobieństwem powyżej 60%
          const filteredTypy = data.filter(typ => typ.prawdopodobienstwo > 60);
          // Sortujemy od najwyższego prawdopodobieństwa
          filteredTypy.sort((a, b) => b.prawdopodobienstwo - a.prawdopodobienstwo);
          setTypy(filteredTypy);
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
        <p className="text-center text-lg mt-8">Brak typów spełniających kryteria analizy (prawdopodobieństwo &gt; 60%).</p>
      ) : (
        <div className="space-y-8">
          {typy.map((mecz) => (
            <div
              key={mecz.id} // Używamy ID meczu jako klucza
              className="bg-gray-800 p-6 rounded-lg shadow-xl border-l-4"
              style={{
                borderColor:
                  mecz.prawdopodobienstwo >= 70
                    ? 'green'
                    : mecz.prawdopodobienstwo >= 60
                    ? 'orange'
                    : 'red'
              }}
            >
              <h2 className="text-2xl font-semibold text-blue-400 mb-2">
                {mecz.gospodarz} vs {mecz.gosc} ({mecz.data})
              </h2>
              <p className="text-lg mb-4">
                <strong>Typ:</strong> <span className="text-yellow-300">{mecz.typ}</span> |{' '}
                <strong>Kurs:</strong> <span className="text-yellow-300">{mecz.kurs}</span> |{' '}
                <strong>Szansa:</strong> <span className="text-yellow-300">{mecz.prawdopodobienstwo}%</span>
              </p>
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {mecz.analiza}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
