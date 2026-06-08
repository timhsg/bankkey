'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  /pro/banks — Suivi des banques sollicitées
//  Kanban : pour chaque prospect, où en est-on avec chaque banque
// ════════════════════════════════════════════════════════════════════════

interface BankSubmission {
  name: string
  submitted_at?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'counter'
  rate?: number
  notes?: string
}

interface Prospect {
  id: string
  email_from_name: string | null
  bank_submitted: BankSubmission[] | null
  scoring: ScoringResult | null
  qualification: QualificationResult | null
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'En attente',
  accepted: 'Accordé',
  rejected: 'Refusé',
  counter:  'Contre-offre',
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  counter:  'bg-blue-50 text-blue-700 border-blue-200',
}

interface SubmissionEntry {
  prospect: Prospect
  bank: BankSubmission
}

export default function BanksPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const { data } = await supabase
      .from('prospects')
      .select('id, email_from_name, bank_submitted, scoring, qualification, status')
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    setProspects((data ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

  // Aplatissement : une ligne par soumission bancaire
  const submissions = useMemo(() => {
    const result: SubmissionEntry[] = []
    for (const p of prospects) {
      if (!p.bank_submitted || p.bank_submitted.length === 0) continue
      for (const bank of p.bank_submitted) {
        result.push({ prospect: p, bank })
      }
    }
    return result
  }, [prospects])

  // Groupement par statut
  const columns = useMemo(() => ({
    pending:  submissions.filter(s => (s.bank.status ?? 'pending') === 'pending'),
    counter:  submissions.filter(s => s.bank.status === 'counter'),
    accepted: submissions.filter(s => s.bank.status === 'accepted'),
    rejected: submissions.filter(s => s.bank.status === 'rejected'),
  }), [submissions])

  const totalPending = columns.pending.length
  const totalAccepted = columns.accepted.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Suivi des banques</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {submissions.length} envois · {totalPending} en attente · {totalAccepted} accordés
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-6">

        {submissions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto">
            <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="22" x2="21" y2="22" />
              <line x1="6" y1="18" x2="6" y2="11" />
              <line x1="10" y1="18" x2="10" y2="11" />
              <line x1="14" y1="18" x2="14" y2="11" />
              <line x1="18" y1="18" x2="18" y2="11" />
              <polygon points="12 2 20 7 4 7" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-900 mb-1">Aucun prospect envoyé en banque</h2>
            <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
              Quand vous ouvrirez un prospect et noterez les banques sollicitées, le suivi apparaîtra ici.
            </p>
            <Link href="/pro/prospects" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Voir mes prospects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['pending', 'counter', 'accepted', 'rejected'] as const).map((status) => (
              <div key={status} className="bg-slate-50 rounded-xl">
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {STATUS_LABEL[status]}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">{columns[status].length}</span>
                  </div>
                </div>
                <div className="p-2 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                  {columns[status].map((s, i) => {
                    const name = s.prospect.qualification?.firstName
                      ? `${s.prospect.qualification.firstName} ${s.prospect.qualification.lastName ?? ''}`.trim()
                      : s.prospect.email_from_name ?? 'Inconnu'

                    return (
                      <button
                        key={`${s.prospect.id}-${i}`}
                        onClick={() => router.push(`/pro/leads/${s.prospect.id}`)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3 text-left transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900 truncate mb-1">{s.bank.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_COLOR[s.bank.status ?? 'pending']}`}>
                            {STATUS_LABEL[s.bank.status ?? 'pending']}
                          </span>
                          {s.bank.rate && (
                            <span className="text-[10px] font-mono text-slate-700">{s.bank.rate}%</span>
                          )}
                        </div>
                        {s.bank.submitted_at && (
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            Envoyé le {new Date(s.bank.submitted_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </button>
                    )
                  })}
                  {columns[status].length === 0 && (
                    <p className="text-[11px] text-slate-400 text-center py-6 px-3">Aucun</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
