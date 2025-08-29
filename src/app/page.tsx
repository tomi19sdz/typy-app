'use client';

import { useEffect, useState } from 'react';
import Banner from './components/Banner';

type Typ = {
  idLeague: string;
  strLeague: string;
  strLeagueAlternate: string | null;
  strSport: string;
  strWebsite: string;
  strBadge: string;
};

export default function HomePage() {
  const [typy, setTypy] = useState<Typ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Teraz pobieramy dane bezpośrednio z naszego endpointu,
    // który jest cachowany przez Vercel.
    fetch('/api/fetch-data')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch data from API route.');
        }
        return res.json();
      })
      .then(data => {
        setTypy(data); 
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd podczas pobierania danych:", error);
        setLoading(false);
        setTypy([]);
      });
  }, []);

  return (
    <div>
      <Banner />
      {loading ? (
        <p className="text-center text-lg mt-8">Ładowanie typów...</p>
      ) : (
        <div className="grid gap-4">
          {typy.length > 0 ? (
            typy.map((t, i) => (
              <div key={t.idLeague} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
                <img src={t.strBadge} alt={`Logo ligi ${t.strLeague}`} className="w-16 h-16" />
                <div>
                  <h2 className="text-xl font-semibold">{t.strLeague}</h2>
                  <p>Sport: {t.strSport}</p>
                  <p>Strona: <a href={`https://${t.strWebsite}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t.strWebsite}</a></p>
                </div>
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
