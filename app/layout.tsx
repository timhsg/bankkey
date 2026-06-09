import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { headers } from 'next/headers';
import { CurrencyProvider } from './_components/CurrencyContext';
import { currencyFromCountry } from '@/lib/currency';
import './globals.css';

// Inter — corps (déjà chargé)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Fraunces — serif distinctive pour titres et accents
// Poids restreints pour ne pas alourdir le LCP
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bankkey.ch'),
  title: 'BankKey — Qualification automatique pour courtiers crédit',
  description: 'Vos emails de prospects qualifiés, scorés et préparés en moins de 60 secondes. Pour les cabinets de courtage en crédit immobilier.',
  openGraph: {
    title: 'BankKey — Qualification automatique pour courtiers crédit',
    description: 'Qualification, scoring et brouillon de réponse en moins de 60 secondes.',
    type: 'website',
    locale: 'fr_CH',
    url: 'https://bankkey.ch',
    siteName: 'BankKey',
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');
  const initialCurrency = currencyFromCountry(country);

  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <CurrencyProvider initialCurrency={initialCurrency}>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
