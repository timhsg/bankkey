'use client'

import { useEffect, useState } from 'react'
import { LogoMark } from './Logo'

// ════════════════════════════════════════════════════════════════════════
//  HeroPreview — Mini-dashboard reproduit fidèlement
//  Reprend l'architecture exacte de /pro pour que ce qu'on voit
//  corresponde à ce qu'on aura après l'inscription.
// ════════════════════════════════════════════════════════════════════════

// Échantillon des prospects réels du dataset démo
const PROSPECTS = [
  { name: 'Camille Martin', city: 'Genève',     score: 87, temp: 'hot' as const,  status: 'new',     desc: 'Couple CDI · compromis signé · 850k CHF' },
  { name: 'Thomas Bernard', city: 'Toulouse',   score: 92, temp: 'hot' as const,  status: 'viewed',  desc: 'Couple cadres · T4 Carmes · apport 26%' },
  { name: 'Sophie Lefèvre', city: 'Lyon',       score: 72, temp: 'hot' as const,  status: 'replied', desc: 'Primo · ingé tech · T3 280k' },
  { name: 'Margaux Lambert',city: 'Strasbourg', score: 68, temp: 'hot' as const,  status: 'viewed',  desc: 'Couple FPH+ingé · T3 250k' },
]

const TEMP_RING: Record<string, string> = {
  cold: '#94a3b8', warm: '#f59e0b', hot: '#10b981',
}

const TEMP_BADGE: Record<string, string> = {
  cold: 'bg-slate-100 text-slate-600',
  warm: 'bg-amber-50 text-amber-700',
  hot:  'bg-emerald-50 text-emerald-700',
}

const TEMP_LABEL: Record<string, string> = {
  cold: 'Non prioritaire', warm: 'À qualifier', hot: 'Prioritaire',
}

function MiniScore({ score, temp }: { score: number; temp: string }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={TEMP_RING[temp]} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-900">{score}</span>
      </div>
    </div>
  )
}

export default function HeroPreview() {
  const [pulseIndex, setPulseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(i => (i + 1) % PROSPECTS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">

      {/* Halo de fond */}
      <div className="absolute -inset-x-20 -top-12 -bottom-12 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-emerald-200/40 via-blue-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Frame navigateur */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">

        {/* Browser bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-2 bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-500 max-w-md mx-auto">
            <span className="text-slate-400">bankkey.ch/pro</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">⌘K</span>
        </div>

        <div className="grid grid-cols-12">

          {/* Sidebar */}
          <div className="col-span-3 bg-white border-r border-slate-100 p-3">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <LogoMark size={22} />
              <span className="font-semibold text-slate-900 text-sm">BankKey</span>
            </div>

            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-1.5">Navigation</p>
            {[
              { label: 'Aujourd\'hui', active: true },
              { label: 'Prospects',    count: 10 },
              { label: 'Banques' },
              { label: 'Bilan' },
              { label: 'Statistiques' },
            ].map(item => (
              <div
                key={item.label}
                className={`relative flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] mb-0.5 ${
                  item.active ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600'
                }`}
              >
                <span>{item.label}</span>
                {item.count && (
                  <span className="text-[9px] font-mono text-slate-400">{item.count}</span>
                )}
                {item.active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-900 rounded-r" />
                )}
              </div>
            ))}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-1.5">Cabinet</p>
              {['Mon profil', 'Abonnement'].map(item => (
                <div key={item} className="px-2 py-1.5 text-[11px] text-slate-600 mb-0.5">{item}</div>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="col-span-9 bg-slate-50/50">

            {/* En-tête salutation */}
            <div className="px-5 pt-5 pb-3">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Mardi 9 juin</p>
              <h2 className="font-semibold text-lg font-medium text-slate-900 mb-0.5 tracking-tight">Bonjour Marie.</h2>
              <p className="text-[11px] text-slate-500">4 prospects prioritaires à traiter aujourd&apos;hui.</p>
            </div>

            {/* Stats */}
            <div className="px-5 pb-3 grid grid-cols-4 gap-2">
              {[
                { label: 'Reçus',        value: 7, accent: '' },
                { label: 'Prioritaires', value: 4, accent: 'text-emerald-700' },
                { label: 'En attente',   value: 3, accent: '' },
                { label: 'Répondus',     value: 2, accent: '' },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5">
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-base font-semibold tracking-tight ${s.accent || 'text-slate-900'}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="px-5 pb-2 pt-1 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-slate-900">À traiter en priorité</h3>
              <span className="text-[9px] text-slate-400">Voir tous →</span>
            </div>

            <div className="px-5 pb-5">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {PROSPECTS.map((p, idx) => (
                  <div
                    key={p.name}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                      idx > 0 ? 'border-t border-slate-100' : ''
                    } ${pulseIndex === idx ? 'bg-emerald-50/40' : ''}`}
                  >
                    <MiniScore score={p.score} temp={p.temp} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-semibold text-slate-900">{p.name}</span>
                        <span className="text-[10px] text-slate-400">· {p.city}</span>
                        {idx === 0 && (
                          <span className="text-[8px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-1 py-0.5 rounded">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{p.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className={`text-[8px] font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-full ${TEMP_BADGE[p.temp]}`}>
                        {TEMP_LABEL[p.temp]}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">{idx === 0 ? 'Maintenant' : `${idx + 1}h`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification flottante */}
      <div className="absolute -right-6 top-20 hidden md:block">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-60 animate-fade-up">
          <div className="flex items-start gap-2">
            <div className="relative shrink-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
              <div className="absolute inset-0 w-2 h-2 mt-1.5 rounded-full bg-emerald-500 animate-soft-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-900 mb-0.5">Lead chaud · Score 87</p>
              <p className="text-[10px] text-slate-500 leading-snug">Camille Martin · Genève · CDI compromis signé</p>
              <p className="text-[9px] text-slate-400 mt-1">À l&apos;instant · email envoyé à marie@</p>
            </div>
          </div>
        </div>
      </div>

      {/* Petit indicateur "Banques" en bas */}
      <div className="absolute -left-4 -bottom-6 hidden md:block">
        <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-44 animate-fade-up">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Banques · ce mois</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-700">CIC</span>
              <span className="text-emerald-700 font-semibold">3 accords</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-700">BNP</span>
              <span className="text-amber-700 font-semibold">2 en cours</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-700">Crédit Agricole</span>
              <span className="text-slate-500 font-semibold">1 refus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
