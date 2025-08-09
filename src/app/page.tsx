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
    fetch('https://twoj-backend-na-render.onrender.com/typy')
      .then(res => res.json())
      .then(data => {
        setTypy(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <Banner />
      {loading ? (
        <p>Ładowanie typów...</p>
      ) : (
        <div className="grid gap-4">
          {typy.map((t, i) => (
            <div key={i} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{t.mecz}</h2>
              <p>Typ: {t.typ} | Kurs: {t.kurs} | Szansa: {t.prawdopodobienstwo}%</p>
              <p className="mt-2 text-sm">{t.analiza}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
