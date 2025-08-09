'use client';

import { useEffect, useState } from 'react';
import Banner from './components/Banner';

type Typ = {
  mecz: string;
  typ: string;
  kurs: number;
  prawdopodobienstwo: number;
  analiza: string;
};

export default function HomePage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Zmieniamy adres URL z zewnętrznego backendu na lokalny plik.
    // Ten plik będzie aktualizowany przez Cron Job na Vercelu.
    fetch('/cached-data.json')
      .then(res => {
        // Sprawdzamy, czy plik istnieje. Jeśli nie, to oznacza błąd 404
        // i po prostu ustawiamy brak danych.
        if (!res.ok) {
          throw new Error('Brak zaktualizowanych danych. Plik nie znaleziono.');
        }
        return res.json();
      })
      .then(data => {
        // Dane z cachowanego pliku są już w odpowiednim formacie, więc
        // możemy je od razu ustawić.
        setTypy(data.response); // Dane z api-sports są w polu 'response'
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania danych:", error);
        setLoading(false);
        setTypy([]); // Ustawiamy pustą tablicę w przypadku błędu
      });
  }, []);

  return (
    <div>
      <Banner />
      {loading ? (
        <p>Ładowanie typów...</p>
      ) : (
        <div className="grid gap-4">
          {typy.length > 0 ? (
            typy.map((t, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold">{t.mecz}</h2>
                <p>Typ: {t.typ} | Kurs: {t.kurs} | Szansa: {t.prawdopodobienstwo}%</p>
                <p className="mt-2 text-sm">{t.analiza}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">Brak dostępnych typów.</p>
          )}
        </div>
      )}
    </div>
  );
}
