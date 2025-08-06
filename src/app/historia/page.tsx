'use client';

import { useEffect, useState } from 'react';

// Definicja typu dla danych meczu (taka sama jak na stronie głównej)
type Typ = {
  data: string;
  gospodarz: string;
  gosc: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string;
};

// Definicja typu dla danych historycznych, pogrupowanych po dacie
type HistoriaTypy = {
  [data: string]: Typ[];
};

export default function HistoriaPage() {
  const [historia, setHistoria] = useState<HistoriaTypy>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoria = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/historia';
        console.log('Fetching history from:', apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        
        // Dane z API są już posortowane, więc możemy je bezpośrednio ustawić
        if (typeof data === 'object' && data !== null) {
          setHistoria(data);
        } else {
          console.error("API returned data that is not an object:", data);
          setError("Otrzymano nieprawidłowy format danych z serwera.");
        }
      } catch (err: any) {
        console.error("Błąd podczas pobierania historii:", err);
        setError(`Błąd ładowania historii: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoria();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie historii...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }
  
  const daty = Object.keys(historia).sort().reverse();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Historia Typów</h1>

      {daty.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak historycznych typów.</p>
      ) : (
        <div className="space-y-8">
          {daty.map((data) => (
            <div key={data}>
              <h2 className="text-2xl font-bold mb-4 text-blue-400 border-b border-blue-400 pb-2">
                Typy z dnia {data}
              </h2>
              <div className="space-y-4">
                {historia[data].map((mecz, index) => (
                  <div
                    key={index}
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
                    <h3 className="text-xl font-semibold">
                      {mecz.gospodarz} vs {mecz.gosc}
                    </h3>
                    <p className="text-sm text-gray-400">{mecz.data}</p>
                    <p className="mt-2">
                      <strong>Typ:</strong> {mecz.typ} | <strong>Kurs:</strong> {mecz.kurs} |{' '}
                      <strong>Szansa:</strong> {mecz.prawdopodobienstwo}%
                    </p>
                    <p className="mt-2 text-sm text-gray-300">{mecz.analiza}</p>
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

