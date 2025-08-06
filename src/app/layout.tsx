import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Zakomentuj, jeśli nie używasz
import "./globals.css"; // Poprawny import CSS
import Link from 'next/link';

// Jeśli używasz Geist fontów, odkomentuj i upewnij się, że są zainstalowane
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: 'Typy Piłkarskie',
  description: 'Najlepsze typy piłkarskie z analizą i historią',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="bg-gray-900 text-white font-sans">
        <header className="bg-gray-800 shadow-md">
          <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
            <div className="text-xl font-bold text-blue-600">Typy Piłkarskie</div>
            <ul className="flex space-x-6 text-sm font-medium">
              <li><Link href="/">Strona Główna</Link></li>
              <li><Link href="/analiza">Analiza</Link></li>
              <li><Link href="/historia">Historia</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
            </ul>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto py-8 px-4">
          {children}
        </main>

        <footer className="text-center text-sm text-gray-500 py-4 border-t mt-12">
          © {new Date().getFullYear()} Typy Piłkarskie. Wszelkie prawa zastrzeżone.
        </footer>
      </body>
    </html>
  );
}

