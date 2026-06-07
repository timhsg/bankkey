'use client'

import Link from 'next/link'
import { useCurrency } from './CurrencyContext'

export default function PricingSection() {
  const { format, getPrice, currency } = useCurrency()

  const trialFeatures = [
    'Gmail connecté',
    'Qualification illimitée',
    'Scoring et pré-dossier',
    'Réponses email rédigées',
    'Briefing d\'appel',
    'Checklist documents auto-générée',
    'Support par email',
  ]

  const proFeatures = [
    'Tout de l\'essai',
    'Volume illimité',
    'Mémoire courtier (signature, ton, banques)',
    'Export CSV des prospects',
    'Webhook API personnalisé',
    'Notifications Slack',
    'Support prioritaire',
    'SLA 99,5 %',
  ]

  return (
    <section id="pricing" className="bg-slate-50 border-y border-slate-100 py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Tarification</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Simple. Transparent. Annulable à tout moment.</h2>
          <p className="text-slate-500 text-sm mt-3">
            Prix affichés en <span className="font-semibold text-slate-700">{currency}</span> — détecté selon votre localisation
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-5 max-w-3xl mx-auto items-start">

          {/* Trial (plus discret) */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Essai</h3>
              <p className="text-xs text-slate-500">Pour découvrir BankKey</p>
            </div>
            <div className="mb-5">
              <span className="text-3xl font-semibold text-slate-900">{format(0)}</span>
              <span className="text-sm text-slate-500 ml-2">/ 30 jours</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {trialFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-400 mt-0.5 shrink-0">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pro/login" className="block w-full text-center py-2 text-sm font-medium border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg transition-colors">
              Démarrer l&apos;essai
            </Link>
          </div>

          {/* Pro (plus prominent) */}
          <div className="md:col-span-7 bg-slate-900 text-white rounded-2xl p-8 flex flex-col relative shadow-xl">
            <div className="absolute -top-3 left-6 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Pour usage régulier
            </div>
            <div className="mb-5">
              <h3 className="text-base font-semibold mb-1">Pro</h3>
              <p className="text-sm text-slate-400">Pour les cabinets actifs</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-semibold tracking-tight">{format(getPrice('pro'))}</span>
              <span className="text-sm text-slate-400 ml-2">/ mois</span>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="text-emerald-400 mt-0.5 shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <span className="text-slate-100">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/book" className="block w-full text-center py-3 text-sm font-medium bg-white hover:bg-slate-100 text-slate-900 rounded-lg transition-colors">
              Réserver une démo avant de souscrire
            </Link>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Sans engagement · Annulation en un clic
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-10">
          Un seul dossier sauvé par mois rembourse l&apos;abonnement
        </p>
      </div>
    </section>
  )
}
