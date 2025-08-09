// src/app/historia/page.tsx
import React, { useEffect, useState } from "react";

// Tworzymy poprawny typ zamiast `any`
type HistoriaItem = {
  id: number;
  data: string;
  opis: string;
};

export default function HistoriaPage() {
  const [historia, setHistoria] = useState<HistoriaItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://twoj-backend.onrender.com/historia");
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data: HistoriaItem[] = await res.json();
        setHistoria(data);
      } catch (error) {
        console.error("Błąd ładowania historii:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Historia</h1>
      <ul>
        {historia.map((item) => (
          <li key={item.id}>
            <strong>{item.data}:</strong> {item.opis}
          </li>
        ))}
      </ul>
    </div>
  );
}
