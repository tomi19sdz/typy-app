'use client';

import { useEffect, useState } from 'react';

type Typ = {
  data: string;
  gospodarz: string;
  gosc: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string;
};

type HistoryData = {
  [date: string]: Typ[];
};

export default function HistoriaPage() {
  const [history, setHistory] = useState<HistoryData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/historia';
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd HTTP! Status: ${response.status}, Wiadomość: ${errorText}`);
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        console.error("Błąd podczas pobierania historii:", err);
        setError(`Błąd ładowania historii: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie historii...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }

  const posortowaneDaty = Object.keys(history).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Historia Typów</h1>
      {posortowaneDaty.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak zapisanej historii.</p>
      ) : (
        <div className="space-y-8">
          {posortowaneDaty.map((data) => (
            <div key={data} className="bg-gray-900 p-6 rounded-md shadow-lg">
              <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">
                Typy z dnia {data}
              </h2>
              <div className="space-y-4">
                {history[data].map((typ, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-4 rounded-md shadow-md border-l-4"
                    style={{
                      borderColor:
                        typ.prawdopodobienstwo >= 70
                          ? 'green'
                          : typ.prawdopodobienstwo >= 60
                          ? 'orange'
                          : 'red'
                    }}
                  >
                    <h3 className="text-xl font-semibold">
                      {typ.gospodarz} vs {typ.gosc}
                    </h3>
                    <p className="text-sm text-gray-400">{typ.data}</p>
                    <p className="mt-2">
                      <strong>Typ:</strong> {typ.typ} | <strong>Kurs:</strong> {typ.kurs} |{' '}
                      <strong>Szansa:</strong> {typ.prawdopodobienstwo}%
                    </p>
                    <p className="mt-2 text-sm text-gray-300">{typ.analiza}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

