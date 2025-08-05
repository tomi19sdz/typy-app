'use client'

import { useEffect, useState } from 'react'

type Typ = {
  data: string
  gospodarz: string
  gosc: string
  typ: string
  kurs: number
  prawdopodobienstwo: number
  analiza: string
}

export default function HomePage() {
  const [typy, setTypy] = useState<Typ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/typy')
      .then(res => res.json())
      .then(data => {
        setTypy(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Błąd podczas pobierania typów:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Typy na Jutro</h1>

      {loading ? (
        <p>Ładowanie typów...</p>
      ) : typy.length === 0 ? (
        <p>Brak typów na jutro.</p>
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
  )
}
