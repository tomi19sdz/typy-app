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
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const fetchTypy = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/typy';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Błąd HTTP! Status: ${response.status}, Wiadomość: ${errorText}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTypy(data);
      } else {
        console.error("API zwróciło dane, które nie są tablicą:", data);
        setError("Otrzymano nieprawidłowy format danych z serwera.");
      }
    } catch (err: any) {
      console.error("Błąd podczas pobierania typów:", err);
      setError(`Błąd ładowania typów: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypy();
  }, []);

  const handleSaveToHistory = async () => {
    if (typy.length === 0) {
      setSaveMessage('Brak typów do zapisania.');
      return;
    }
    setSaveMessage('Zapisywanie...');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/zapisz-typy-historie';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(typy),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Błąd HTTP! Status: ${response.status}, Wiadomość: ${errorText}`);
      }

      setSaveMessage('Typy zostały pomyślnie zapisane do historii!');
    } catch (err: any) {
      console.error("Błąd podczas zapisywania typów:", err);
      setSaveMessage(`Błąd zapisywania: ${err.message}`);
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

      <div className="flex justify-center mb-6">
        <button
          onClick={handleSaveToHistory}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Zapisz typy do historii
        </button>
      </div>
      {saveMessage && (
        <p className={`text-center mt-4 ${saveMessage.startsWith('Błąd') ? 'text-red-500' : 'text-green-500'}`}>
          {saveMessage}
        </p>
      )}

      {typy.length === 0 ? (
        <p className="text-center text-lg mt-8">Brak typów na jutro.</p>
      ) : (
        <div className="space-y-4">
          {typy.map((mecz, index) => (
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

