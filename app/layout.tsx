import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BankKey — Qualification automatique pour courtiers crédit',
  description: 'Chaque demande de financement reçue par email qualifiée, scorée et préparée en moins de 60 secondes. Pour les cabinets de courtage en crédit immobilier.',
  openGraph: {
    title: 'BankKey — Qualification automatique pour courtiers crédit',
    description: 'Qualification, scoring et préparation de réponse en moins de 60 secondes.',
    type: 'website',
    locale: 'fr_CH',
    url: 'https://bankkey.ch',
    siteName: 'BankKey',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
