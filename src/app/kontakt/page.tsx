'use client';

import React, { useState } from 'react';

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('Wysyłanie wiadomości...');
    // Tutaj w prawdziwej aplikacji wysyłałbyś dane do backendu (np. przez API)
    // Na potrzeby tej symulacji, po prostu symulujemy wysyłkę
    setTimeout(() => {
      setSubmissionStatus('Wiadomość została wysłana pomyślnie! Dziękujemy za kontakt.');
      setFormData({ name: '', email: '', message: '' }); // Wyczyść formularz
    }, 2000);
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">Skontaktuj się z nami</h1>
        <p className="text-gray-300 text-center mb-8">
          Masz pytania, sugestie lub potrzebujesz wsparcia? Wypełnij poniższy formularz lub skontaktuj się z nami bezpośrednio.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Twoje Imię
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Jan Kowalski"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Twój Adres E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">
              Wiadomość
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Wpisz swoją wiadomość tutaj..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Wyślij Wiadomość
          </button>
        </form>

        {submissionStatus && (
          <p className={`mt-4 text-center text-sm ${submissionStatus.includes('Błąd') ? 'text-red-400' : 'text-green-400'}`}>
            {submissionStatus}
          </p>
        )}

       
      </div>
    </section>
  );
}
