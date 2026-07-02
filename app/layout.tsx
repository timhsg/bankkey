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
  title: 'BankKey · le logiciel des courtiers qui répondent en premier',
  description: 'BankKey centralise vos demandes de financement, les qualifie et prépare vos réponses. Vous ne traitez que les dossiers qui valent un appel, avant votre café.',
  openGraph: {
    title: 'Le premier courtier à répondre décroche le dossier.',
    description: 'BankKey centralise, qualifie et prépare vos demandes de financement. Vous gagnez des heures et vous répondez en premier.',
    type: 'website',
    locale: 'fr_CH',
    url: 'https://bankkey.ch',
    siteName: 'BankKey',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le premier courtier à répondre décroche le dossier.',
    description: 'BankKey centralise, qualifie et prépare vos demandes de financement. Vous répondez en premier.',
  },
  keywords: [
    'courtier crédit immobilier', 'logiciel courtier', 'qualification leads courtage',
    'gestion demandes de financement', 'CRM courtage', 'IOBSP', 'courtier France Suisse',
  ],
  applicationName: 'BankKey',
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
