'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCurrency } from './CurrencyContext'
import { getPlanMonthly, getPlanAnnualMonthly } from '@/lib/currency'

// ════════════════════════════════════════════════════════════════════════
//  Grille tarifaire landing — Solo / Cabinet / Réseau
//  Devise dynamique (EUR/CHF) + bascule mensuel / annuel (2 mois offerts).
// ════════════════════════════════════════════════════════════════════════

function Check({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function PricingTiers() {
  const { format, currency } = useCurrency()
  const [annual, setAnnual] = useState(false)

  const priceFor = (plan: 'solo' | 'cabinet') =>
    annual ? getPlanAnnualMonthly(plan, currency) : getPlanMonthly(plan, currency)

  const tiers = [
    {
      id: 'solo' as const,
      name: 'Solo',
      tagline: 'Pour le courtier indépendant',
      price: priceFor('solo'),
      features: [
        'Jusqu\'à 60 leads / mois',
        'Qualification + score de finançabilité',
        'Réponse rédigée pour chaque prospect',
        'Briefing d\'appel + checklist FR / CH',
        'Connexion Gmail, Outlook ou transfert',
        'Support par email',
      ],
      cta: { label: 'Démarrer l\'essai gratuit', href: '/pro/login' },
      highlight: false,
    },
    {
      id: 'cabinet' as const,
      name: 'Cabinet',
      tagline: 'Pour les cabinets actifs',
      price: priceFor('cabinet'),
      features: [
        'Tout Solo, plus :',
        'Leads illimités, toutes sources',
        'Jusqu\'à 5 courtiers',
        'Scoring sur-mesure (vos critères banques)',
        'Outlook, IMAP, webhook & API d\'ingestion',
        'Support prioritaire',
      ],
      cta: { label: 'Réserver une démo', href: '/book' },
      highlight: true,
    },
    {
      id: 'reseau' as const,
      name: 'Réseau',
      tagline: 'Plusieurs agences',
      price: null,
      features: [
        'Tout Cabinet, plus :',
        'Multi-agences centralisé',
        'API & webhooks dédiés',
        'Onboarding accompagné',
        'Facturation centralisée & SLA',
        'Interlocuteur dédié',
      ],
      cta: { label: 'Nous contacter', href: '/book' },
      highlight: false,
    },
  ]

  return (
    <div>
      {/* Toggle mensuel / annuel */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-semibold ${!annual ? 'text-navy' : 'text-[#9CA3AF]'}`}>Mensuel</span>
        <button
          onClick={() => setAnnual(a => !a)}
          className="relative w-12 h-6 rounded-full bg-navy transition-colors"
          aria-label="Basculer mensuel / annuel"
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${annual ? 'left-6' : 'left-0.5'}`} />
        </button>
        <span className={`text-sm font-semibold ${annual ? 'text-navy' : 'text-[#9CA3AF]'}`}>
          Annuel <span className="text-emerald-600 font-bold">−2 mois</span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto items-stretch">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={`relative rounded-2xl p-7 flex flex-col bg-white ${
              t.highlight
                ? 'border-2 border-accent shadow-[0_8px_40px_rgba(59,95,224,0.14)]'
                : 'border border-[#E5E7EB]'
            }`}
          >
            {t.highlight && (
              <span className="absolute -top-3 left-7 bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                Le plus choisi
              </span>
            )}

            <h3 className="text-base font-extrabold text-navy">{t.name}</h3>
            <p className="text-xs text-[#6B7280] mb-5">{t.tagline}</p>

            <div className="mb-5 min-h-[3.25rem]">
              {t.price === null ? (
                <span className="text-3xl font-extrabold text-navy tracking-tightest">Sur devis</span>
              ) : (
                <>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-navy tracking-tightest tabular-nums">{format(t.price)}</span>
                    <span className="text-[#6B7280] font-medium text-sm">/ mois</span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] mt-1">
                    {annual ? 'facturé annuellement (2 mois offerts)' : 'sans engagement, annulable à tout moment'}
                  </p>
                </>
              )}
            </div>

            <ul className="space-y-2.5 mb-7 flex-1">
              {t.features.map((f, i) => (
                <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? 'font-semibold text-navy' : 'text-[#374151]'}`}>
                  {i === 0 ? (
                    <span className="w-5 h-0 shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check />
                    </span>
                  )}
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={t.cta.href}
              className={`block w-full text-center py-3 text-sm font-bold rounded-lg transition-all ${
                t.highlight
                  ? 'bg-navy text-white hover:bg-navy/90'
                  : 'border border-[#D1D5DB] text-navy hover:border-navy'
              }`}
            >
              {t.cta.label}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center space-y-1.5">
        <p className="text-sm font-semibold text-navy">
          Programme fondateur — les 20 premiers cabinets : <span className="text-emerald-600">3 mois offerts</span>
        </p>
        <p className="text-xs text-[#9CA3AF]">
          30 jours d&apos;essai gratuit, sans carte bancaire · France &amp; Suisse · Prix affichés en {currency}
        </p>
      </div>
    </div>
  )
}
