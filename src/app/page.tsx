'use client';

import { useEffect, useState } from 'react';

// Definicja typu dla danych meczu
type Typ = {
  data: string;
  gospodarz: string;
  gosc: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string;
};

export default function HomePage() {
  const [typy, setTypy] = useState<Typ[]>([]); // Inicjalizacja jako pusta tablica
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Dodaj stan dla błędów

  useEffect(() => {
    const fetchTypy = async () => {
      try {
        // WAŻNE: Użyj zmiennej środowiskowej NEXT_PUBLIC_API_URL
        // To jest adres Twojego backendu na Render.com
        // Upewnij się, że w Vercel zmienna NEXT_PUBLIC_API_URL ma wartość https://typy-app.onrender.com
        const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/typy';
        console.log('Attempting to fetch from:', apiUrl); // Loguj adres, aby sprawdzić w konsoli przeglądarki

        const response = await fetch(apiUrl);

        if (!response.ok) {
          // Obsługa błędów HTTP (np. 404, 500)
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();

        // WAŻNE: Zabezpiecz się przed błędem .map is not a function
        if (Array.isArray(data)) {
          setTypy(data);
        } else {
          // Jeśli API zwróciło coś, co nie jest tablicą
          console.error("API returned data that is not an array:", data);
          setError("Otrzymano nieprawidłowy format danych z serwera.");
        }
      } catch (err: unknown) { // Zmieniono 'any' na 'unknown'
        console.error("Błąd podczas pobierania typów:", err);
        if (err instanceof Error) { // Dodano sprawdzenie typu błędu
          setError(`Błąd ładowania typów: ${err.message}`);
        } else {
          setError("Wystąpił nieznany błąd podczas ładowania typów.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTypy();
  }, []); // Pusta tablica zależności oznacza, że useEffect uruchomi się tylko raz po zamontowaniu komponentu

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
        <p className="text-center text-lg mt-8">Brak typów na jutro.</p>
      ) : (
        <div className="space-y-4">
          {typy.map((mecz, index) => (
            <div
              key={index} // Lepiej używać unikalnego ID z danych, jeśli dostępne (np. mecz.id)
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
              <p className="mt-2 text-sm text-gray-300">{mecz.analiza}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
