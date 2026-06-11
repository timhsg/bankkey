import type { Metadata } from 'next';
import { Hanken_Grotesk, Bricolage_Grotesque } from 'next/font/google';
import { headers } from 'next/headers';
import { CurrencyProvider } from './_components/CurrencyContext';
import { currencyFromCountry } from '@/lib/currency';
import './globals.css';

// Hanken Grotesk — corps de texte : chaleureux, précis, très lisible
const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Bricolage Grotesque — titres : grotesque de caractère, ton fintech affirmé
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
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
    <html lang="fr" className={`${hanken.variable} ${bricolage.variable}`}>
      <body className="font-sans antialiased">
        <CurrencyProvider initialCurrency={initialCurrency}>
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
