'use client'

import { useState } from 'react'

// ════════════════════════════════════════════════════════════════════════
//  Section "Banques" du Product Theater
//  Reproduction fidèle de /pro/banks : kanban 4 colonnes
// ════════════════════════════════════════════════════════════════════════

interface BankDeal {
  prospect: string
  amount: string
  rate?: string
  bank: string
  notes?: string
}

interface Column {
  id: 'pending' | 'counter' | 'accepted' | 'rejected'
  label: string
  color: string
  deals: BankDeal[]
}

const COLUMNS: Column[] = [
  {
    id: 'pending',
    label: 'En attente',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    deals: [
      { prospect: 'Camille Martin',  amount: '680 000 CHF', bank: 'BCV',          notes: 'Envoyé jeudi · attente sous 5j' },
      { prospect: 'Thomas Bernard',  amount: '315 000 €',   bank: 'CIC Sud-Ouest',notes: 'Premier dossier · suivi vendredi' },
      { prospect: 'Sophie Lefèvre',  amount: '230 000 €',   bank: 'Crédit Mutuel',notes: 'Analyste demande compromis signé' },
    ],
  },
  {
    id: 'counter',
    label: 'Contre-offre',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    deals: [
      { prospect: 'Pierre Garcia',  amount: '1 295 000 CHF', rate: '2,1%', bank: 'Banque Migros',  notes: 'Conditions à finaliser sur LTV' },
      { prospect: 'Marc Dubois',    amount: '220 000 €',     rate: '3,15%',bank: 'Crédit Agricole', notes: 'Demande baisse 0,1pt' },
    ],
  },
  {
    id: 'accepted',
    label: 'Accordé',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    deals: [
      { prospect: 'Margaux Lambert', amount: '212 500 €', rate: '3,28%', bank: 'CIC Est', notes: 'Édition d\'offre la semaine prochaine' },
      { prospect: 'Antoine Rousseau',amount: '170 000 €', rate: '3,45%', bank: 'Crédit du Nord', notes: 'Validé · acceptation client OK' },
    ],
  },
  {
    id: 'rejected',
    label: 'Refusé',
    color: 'bg-red-50 text-red-700 border-red-200',
    deals: [
      { prospect: 'Lisa Moreau', amount: '230 000 €', bank: 'Société Générale', notes: 'Taux d\'effort > 35%' },
    ],
  },
]

export default function BanksKanban() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Suivi banques</p>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">Là où vous en êtes dossier par dossier</h3>
        </div>
        <span className="text-xs text-slate-500">
          {COLUMNS.reduce((sum, c) => sum + c.deals.length, 0)} dossiers actifs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {COLUMNS.map(col => (
          <div key={col.id} className="p-3 min-h-[260px]">

            <div className="flex items-center justify-between mb-3 px-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${col.color}`}>
                {col.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{col.deals.length}</span>
            </div>

            <div className="space-y-2">
              {col.deals.map((d, i) => {
                const key = `${col.id}-${i}`
                return (
                  <div
                    key={key}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    className={`bg-white border rounded-lg p-2.5 cursor-pointer transition-all ${
                      hovered === key
                        ? 'border-slate-300 shadow-sm'
                        : 'border-slate-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-slate-900 truncate">{d.prospect}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{d.bank}</p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-xs font-mono text-slate-700">{d.amount}</span>
                      {d.rate && (
                        <span className="text-[10px] font-mono text-emerald-700">{d.rate}</span>
                      )}
                    </div>
                    {d.notes && (
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-snug line-clamp-2">
                        {d.notes}
                      </p>
                    )}
                  </div>
                )
              })}
              {col.deals.length === 0 && (
                <p className="text-[10px] text-slate-300 text-center py-4">Aucun dossier</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          Quand une banque accorde, BankKey vous demande automatiquement le taux et la commission.
          Ces données alimentent vos statistiques.
        </p>
      </div>
    </section>
  )
}
