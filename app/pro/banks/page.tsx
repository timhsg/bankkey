'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ScoringResult, QualificationResult } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/banks — Suivi des banques sollicitées
//  Kanban bancaire : 4 colonnes (En attente / Contre-offre / Accordé / Refusé)
// ═══════════════════════════════════════════════════════════════════════

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

const STATUS = {
  pending:  { label: 'En attente',   pill: 'bg-amber-50 text-amber-700 border-amber-200',     col: 'border-amber-300',   dot: 'bg-amber-500' },
  counter:  { label: 'Contre-offre', pill: 'bg-blue-50 text-blue-700 border-blue-200',        col: 'border-blue-300',    dot: 'bg-blue-500' },
  accepted: { label: 'Accordé',      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',col: 'border-emerald-300', dot: 'bg-emerald-500' },
  rejected: { label: 'Refusé',       pill: 'bg-red-50 text-red-700 border-red-200',           col: 'border-red-300',     dot: 'bg-red-500' },
} as const

type StatusKey = keyof typeof STATUS

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
      .not('status', 'in', '(archived,filtered)')
      .order('created_at', { ascending: false })

    setProspects((data ?? []) as Prospect[])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { void load() }, [load])

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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA]">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  const COLUMNS_ORDER: StatusKey[] = ['pending', 'counter', 'accepted', 'rejected']

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header de page ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4 flex-wrap">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Pipeline</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Suivi banques</h1>
            <p className="text-xs text-[#6B7280] mt-1.5 tabular-nums">
              {submissions.length} envoi{submissions.length > 1 ? 's' : ''} · {totalPending} en attente · {totalAccepted} accordé{totalAccepted > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-6">

        {submissions.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="22" x2="21" y2="22" />
                <line x1="6" y1="18" x2="6" y2="11" />
                <line x1="10" y1="18" x2="10" y2="11" />
                <line x1="14" y1="18" x2="14" y2="11" />
                <line x1="18" y1="18" x2="18" y2="11" />
                <polygon points="12 2 20 7 4 7" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-navy mb-1">Aucun dossier envoyé en banque</h2>
            <p className="text-xs text-[#6B7280] mb-5 max-w-md mx-auto leading-relaxed">
              Dès qu&apos;un prospect aura été envoyé en banque depuis sa fiche, le suivi apparaîtra ici.
            </p>
            <Link href="/pro/prospects" className="btn-primary text-sm py-2 px-4">
              Voir mes prospects
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Kanban 4 colonnes */}
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-3 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
              {COLUMNS_ORDER.map((status) => {
                const cfg = STATUS[status]
                return (
                  <div key={status} className={`bg-white rounded-xl shrink-0 w-[85vw] sm:w-[60vw] md:w-auto snap-start border-t-2 ${cfg.col}`}>
                    <div className="px-4 py-3 border-b border-[#F3F4F6]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">
                            {cfg.label}
                          </h3>
                        </div>
                        <span className="text-xs font-bold text-[#9CA3AF] tabular-nums">{columns[status].length}</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 md:max-h-[calc(100vh-220px)] md:overflow-y-auto">
                      {columns[status].map((s, i) => {
                        const name = s.prospect.qualification?.firstName
                          ? `${s.prospect.qualification.firstName} ${s.prospect.qualification.lastName ?? ''}`.trim()
                          : s.prospect.email_from_name ?? 'Inconnu'

                        return (
                          <button
                            key={`${s.prospect.id}-${i}`}
                            onClick={() => router.push(`/pro/leads/${s.prospect.id}`)}
                            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] hover:border-navy hover:bg-white rounded-lg p-3 text-left transition-all"
                          >
                            <p className="text-sm font-bold text-navy truncate mb-1">{s.bank.name}</p>
                            <p className="text-[11px] text-[#6B7280] truncate">{name}</p>
                            <div className="flex items-center justify-between mt-2.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.pill}`}>
                                {cfg.label}
                              </span>
                              {s.bank.rate && (
                                <span className="text-[11px] font-extrabold text-navy tabular-nums">{s.bank.rate}%</span>
                              )}
                            </div>
                            {s.bank.submitted_at && (
                              <p className="text-[10px] text-[#9CA3AF] mt-2 font-medium">
                                Envoyé le {new Date(s.bank.submitted_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </button>
                        )
                      })}
                      {columns[status].length === 0 && (
                        <p className="text-[11px] text-[#9CA3AF] text-center py-8 px-3 font-medium">Aucun</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="md:hidden text-[10px] text-[#9CA3AF] text-center mt-3 font-medium">← Glissez pour voir les autres colonnes</p>
          </>
        )}
      </main>
    </div>
  )
}
