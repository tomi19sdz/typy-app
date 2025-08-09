'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-green-400">⚽ TypyApp</div>
        <ul className="flex space-x-6">
          <li><Link href="/">Strona główna</Link></li>
          <li><Link href="/analiza">Analiza</Link></li>
          <li><Link href="/historia">Historia</Link></li>
          <li><Link href="/kontakt">Kontakt</Link></li>
        </ul>
      </nav>
    </header>
  );
}
