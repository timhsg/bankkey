'use client'

import Link from 'next/link'

interface IncompleteProspect {
  id: string
  name: string
  status: string
  bank_count: number
}

interface Props {
  totalProspects: number
  withOutcome: number
  incompleteWithBanks: IncompleteProspect[]  // Dossiers avec banques pending mais sans outcome
}

// ════════════════════════════════════════════════════════════════════════
//  Complétude — visualise la valeur que le courtier débloque
//  en remplissant ses outcomes
// ════════════════════════════════════════════════════════════════════════

const TIERS = [
  { threshold: 0,  label: 'Démarrage',        message: 'Ajoutez vos premiers résultats bancaires pour activer les statistiques' },
  { threshold: 5,  label: 'Aperçu',           message: 'Premières tendances visibles, continuez pour affiner' },
  { threshold: 15, label: 'Pilotage',         message: 'Vous avez assez de données pour piloter vos négociations' },
  { threshold: 30, label: 'Expertise',        message: 'Vos repères sont robustes, vous êtes en avance' },
  { threshold: 50, label: 'Mémoire complète', message: 'Votre cabinet a une mémoire institutionnelle complète' },
]

export default function CompletenessCard({ totalProspects, withOutcome, incompleteWithBanks }: Props) {
  const currentTier = TIERS.slice().reverse().find(t => withOutcome >= t.threshold) ?? TIERS[0]
  const nextTier = TIERS.find(t => t.threshold > withOutcome)

  const progressPct = nextTier
    ? Math.round(100 * (withOutcome - currentTier.threshold) / (nextTier.threshold - currentTier.threshold))
    : 100

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white rounded-2xl overflow-hidden">

      <div className="px-6 py-5">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Niveau de votre mémoire cabinet</p>
            <h2 className="text-xl font-semibold tracking-tight">{currentTier.label}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight">{withOutcome}</p>
            <p className="text-[10px] text-slate-400">résultats enregistrés</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">{currentTier.message}</p>

        {nextTier && (
          <>
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="text-slate-400">Vers : <span className="font-semibold text-white">{nextTier.label}</span></span>
              <span className="text-slate-400 font-mono">{withOutcome} / {nextTier.threshold}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Dossiers à compléter — incitation directe */}
      {incompleteWithBanks.length > 0 && (
        <div className="bg-slate-800/60 px-6 py-4 border-t border-slate-700">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            {incompleteWithBanks.length} prospect{incompleteWithBanks.length > 1 ? 's' : ''} en attente de décision bancaire
          </p>
          <div className="space-y-1.5">
            {incompleteWithBanks.slice(0, 3).map(p => (
              <Link
                key={p.id}
                href={`/pro/leads/${p.id}`}
                className="flex items-center justify-between text-xs text-slate-200 hover:text-white transition-colors group py-1"
              >
                <span className="truncate">{p.name}</span>
                <span className="flex items-center gap-2 text-slate-400 shrink-0 ml-3">
                  {p.bank_count} banque{p.bank_count > 1 ? 's' : ''} envoyée{p.bank_count > 1 ? 's' : ''}
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </Link>
            ))}
            {incompleteWithBanks.length > 3 && (
              <p className="text-[10px] text-slate-500 mt-2">+ {incompleteWithBanks.length - 3} autres prospects</p>
            )}
          </div>
        </div>
      )}

      {totalProspects > 0 && withOutcome === 0 && (
        <div className="bg-slate-800/60 px-6 py-4 border-t border-slate-700 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Comment alimenter cette mémoire ?</span><br/>
          Quand vous marquez une banque comme <span className="text-emerald-400">Accordée</span> ou <span className="text-red-400">Refusée</span> dans un prospect, BankKey vous demande les conditions exactes. Ces données restent privées et alimentent vos repères personnels.
        </div>
      )}
    </div>
  )
}
