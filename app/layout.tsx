import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { CurrencyProvider } from './_components/CurrencyContext';
import { currencyFromCountry } from '@/lib/currency';
import './globals.css';

// Inter — la police de Stripe, Linear, Vercel. Lisible, moderne, technique.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bankkey.ch'),
  title: 'BankKey — Qualification automatique pour courtiers crédit',
  description: 'BankKey lit vos emails de demande de financement, score la bancabilité et prépare la réponse. Vos 6 vrais dossiers en haut. Avant votre café.',
  openGraph: {
    title: 'BankKey — Qualification automatique pour courtiers crédit',
    description: 'Vos emails qualifiés, scorés et préparés en moins de 60 secondes.',
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
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-[#0A0F1E]">
        <CurrencyProvider initialCurrency={initialCurrency}>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
