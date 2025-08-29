'use client';

import { useEffect, useState } from 'react';

type Team = {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
};

export default function AnalizaPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        // Zmieniono URL, aby pobrać dane Arsenalu
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=Arsenal`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Błąd HTTP! Status: ${response.status}, Message: ${errorText}`);
        }

        const data = await response.json();
        
        if (data && Array.isArray(data.teams) && data.teams.length > 0) {
          setTeam(data.teams[0]);
        } else {
          setError("Nie znaleziono danych o drużynie.");
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`Błąd ładowania danych: ${err.message}`);
        } else {
          setError("Wystąpił nieznany błąd podczas ładowania danych.");
        }
        console.error("Błąd podczas pobierania danych:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  if (loading) {
    return <p className="text-center text-lg mt-8">Ładowanie...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg mt-8">Błąd: {error}</p>;
  }
  
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      {team ? (
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">{team.strTeam}</h1>
          <img 
            src={team.strTeamBadge} 
            alt={`Logo drużyny ${team.strTeam}`} 
            className="mx-auto w-48 h-48 rounded-full border-4 border-green-500 shadow-lg"
          />
        </div>
      ) : (
        <p className="text-center text-lg mt-8">Brak danych o drużynie do wyświetlenia.</p>
      )}
    </section>
  );
}
