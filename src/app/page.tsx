'use client';

import { useEffect, useState } from 'react';

// Typ danych z API
type Typ = {
  id: number;
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

  useEffect(() => {
    fetch('https://typy-app.onrender.com/api/typy') // <- pełny URL backendu na Render
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Błąd API: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setTypy(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Ładowanie danych...</p>;
  if (error) return <p>Błąd: {error}</p>;

  return (
    <main style={{ padding: '20px' }}>
      <h1>Dzisiejsze typy</h1>
      <ul>
        {typy.map((mecz) => (
          <li key={mecz.id} style={{ marginBottom: '10px' }}>
            <strong>{mecz.gospodarz} vs {mecz.gosc}</strong> <br />
            Typ: {mecz.typ} | Kurs: {mecz.kurs} | Szansa: {mecz.prawdopodobienstwo}% <br />
            Analiza: {mecz.analiza}
          </li>
        ))}
      </ul>
    </main>
  );
}
