'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateDocumentChecklist } from '@/lib/documents/checklist'
import type { QualificationResult, ScoringResult, ProspectionResult, DocumentChecklistResult } from '@/types'
import NotesEditor from '../../_components/NotesEditor'
import BankTracker from '../../_components/BankTracker'
import ActivityTimeline from '../../_components/ActivityTimeline'
import EditQualificationModal from '../../_components/EditQualificationModal'
import { logActivity, activityViewed, type Activity } from '@/lib/activity'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/leads/[id] — Fiche détaillée prospect (style bancaire pro)
// ═══════════════════════════════════════════════════════════════════════

interface BankSubmission {
  name: string
  submitted_at?: string
  status?: 'pending' | 'accepted' | 'rejected' | 'counter'
  rate?: number
  notes?: string
}

interface ProspectFull {
  id: string
  email_from_name: string | null
  email_from: string | null
  email_subject: string | null
  email_body: string | null
  gmail_thread_id: string | null
  received_at: string | null
  created_at: string
  status: string
  qualification: QualificationResult | null
  scoring: ScoringResult | null
  prospection: ProspectionResult | null
  broker_notes: string | null
  bank_submitted: BankSubmission[] | null
  activity: Activity[] | null
}

type Tab = 'overview' | 'communication' | 'banks' | 'history'

const TEMP = {
  cold: { label: 'Non prioritaire', cls: 'bg-slate-100 text-slate-600 border-slate-200',     ring: '#94a3b8' },
  warm: { label: 'À qualifier',     cls: 'bg-amber-50 text-amber-700 border-amber-200',      ring: '#f59e0b' },
  hot:  { label: 'Prioritaire',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',ring: '#10b981' },
} as const

const TIMELINE_LABEL: Record<string, string> = {
  less_3_months:   'Moins de 3 mois',
  '3_to_6_months': '3 à 6 mois',
  more_6_months:   'Plus de 6 mois',
}

const FINANCING_LABEL: Record<string, string> = {
  obtained: 'Accord obtenu', in_progress: 'En cours', none: 'Non démarré',
}

const EMPLOYMENT_LABEL: Record<string, string> = {
  cdi: 'CDI', fonctionnaire: 'Fonctionnaire', cdd: 'CDD / Intérim',
  independant: 'Indépendant', retraite: 'Retraité', sans_emploi: 'Sans emploi',
}

const JURISDICTION_LABEL: Record<string, string> = {
  FR: 'France', CH: 'Suisse', unknown: 'À préciser',
}

function detectCurrency(q: QualificationResult): string {
  const text = `${q.address ?? ''} ${q.description ?? ''}`.toLowerCase()
  if (/genève|geneve|lausanne|zurich|chf|suisse/.test(text)) return 'CHF'
  return '€'
}

const I = {
  Phone: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>,
  Mail: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
  MapPin: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  Spark: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  Circle: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
  Copy: () => <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>,
}

function ScoreRing({ score, temperature }: { score: number; temperature: 'cold' | 'warm' | 'hot' }) {
  const r = 34, circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const color  = TEMP[temperature].ring

  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-navy leading-none tracking-tightest tabular-nums">{score}</span>
        <span className="text-[9px] font-bold text-[#9CA3AF] mt-1 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cfg = {
    new:      { label: 'Nouveau',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    viewed:   { label: 'Vu',       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    replied:  { label: 'Répondu',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    archived: { label: 'Archivé',  cls: 'bg-slate-50 text-slate-400 border-slate-200' },
  }[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' }

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════════════

export default function LeadDetailPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const supabase = createClient()

  const [prospect, setProspect] = useState<ProspectFull | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<Tab>('overview')
  const [copied,   setCopied]   = useState(false)
  const [sending,  setSending]  = useState(false)
  const [editingQual, setEditingQual] = useState(false)
  const [profile,  setProfile]  = useState<{ gmail_access_token: string | null; gmail_refresh_token: string | null } | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: prof }] = await Promise.all([
        supabase.from('prospects').select('*').eq('id', params.id).single(),
        supabase.from('profiles').select('gmail_access_token, gmail_refresh_token').single(),
      ])

      setProspect(p as ProspectFull)
      setProfile(prof)

      if (p?.status === 'new') {
        await supabase.from('prospects').update({ status: 'viewed' }).eq('id', params.id)
      }

      const lastViewLog = (p?.activity as Activity[] | undefined)
        ?.filter(a => a.type === 'viewed')
        .pop()
      const lastViewTime = lastViewLog ? new Date(lastViewLog.at).getTime() : 0
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      if (lastViewTime < oneDayAgo) {
        void logActivity(supabase, params.id, activityViewed())
      }

      setLoading(false)
    }
    void load()
  }, [params.id, supabase])

  const documents: DocumentChecklistResult | null = useMemo(
    () => prospect?.qualification ? generateDocumentChecklist(prospect.qualification) : null,
    [prospect?.qualification]
  )

  const [sentToast, setSentToast] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [editedSubject, setEditedSubject] = useState<string>('')
  const [editedBody, setEditedBody]       = useState<string>('')

  useEffect(() => {
    if (prospect?.prospection?.email) {
      setEditedSubject(prospect.prospection.email.subject)
      setEditedBody(prospect.prospection.email.body)
    }
  }, [prospect?.prospection?.email])

  async function sendReply() {
    if (!prospect?.prospection || !profile?.gmail_access_token || !profile?.gmail_refresh_token) return
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/gmail/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:       prospect.email_from,
          subject:  editedSubject || prospect.email_subject || 'Réponse',
          body:     editedBody || prospect.prospection.email.body,
          threadId: prospect.gmail_thread_id,
        }),
      })
      if (res.ok) {
        await supabase.from('prospects').update({ status: 'replied' }).eq('id', params.id)
        setProspect(p => p ? { ...p, status: 'replied' } : p)
        const { logActivity, activityEmailSent } = await import('@/lib/activity')
        await logActivity(supabase, params.id, activityEmailSent())
        setSentToast(true)
        setTimeout(() => setSentToast(false), 4000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Erreur d\'envoi' }))
        setSendError(err.error ?? 'L\'envoi a échoué')
        setTimeout(() => setSendError(null), 5000)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'L\'envoi a échoué')
      setTimeout(() => setSendError(null), 5000)
    } finally {
      setSending(false)
    }
  }

  async function archive() {
    await supabase.from('prospects').update({ status: 'archived' }).eq('id', params.id)
    router.push('/pro/prospects')
  }

  function copyEmail() {
    if (!prospect?.prospection) return
    const text = `Objet : ${prospect.prospection.email.subject}\n\n${prospect.prospection.email.body}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#E5E7EB] border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  if (!prospect) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#6B7280] text-sm">Prospect introuvable.</p>
      </div>
    )
  }

  const q    = prospect.qualification
  const s    = prospect.scoring
  const p    = prospect.prospection
  const temp = s?.temperature ? TEMP[s.temperature] : null
  const fullName = q ? [q.firstName, q.lastName].filter(Boolean).join(' ') : null
  const currency = q ? detectCurrency(q) : '€'
  const cityFromAddress = q?.address?.split(',')[0]?.trim()

  const downPaymentPct = q?.down_payment && q?.price ? Math.round((q.down_payment / q.price) * 100) : null
  const debtRatio = q?.existing_debts_monthly !== null && q?.existing_debts_monthly !== undefined && q?.monthly_income
    ? Math.round((q.existing_debts_monthly / q.monthly_income) * 100)
    : null

  const TABS = [
    { id: 'overview'      as const, label: 'Vue d\'ensemble', enabled: true },
    { id: 'communication' as const, label: 'Communication',   enabled: !!p, badge: p ? undefined : 'manuel' },
    { id: 'banks'         as const, label: 'Banques',         enabled: true, badge: prospect.bank_submitted && prospect.bank_submitted.length > 0 ? String(prospect.bank_submitted.length) : undefined },
    { id: 'history'       as const, label: 'Historique',      enabled: true, badge: documents?.urgency === 'urgent' ? 'urgent' : undefined },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* ── Header de page avec breadcrumb + actions ── */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-4">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs pl-12 lg:pl-0 min-w-0">
            <button
              onClick={() => router.push('/pro/prospects')}
              className="text-[#6B7280] hover:text-navy font-medium transition-colors shrink-0"
            >
              Prospects
            </button>
            <svg className="w-3 h-3 text-[#D1D5DB] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="text-navy font-bold truncate">{fullName ?? prospect.email_from_name ?? 'Prospect'}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={archive}
              className="text-xs font-semibold text-[#6B7280] hover:text-navy bg-white border border-[#D1D5DB] hover:border-navy px-3 py-2 rounded-lg transition-all"
            >
              Archiver
            </button>
            {prospect.status === 'replied' ? (
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Répondu
              </span>
            ) : (
              <button
                onClick={sendReply}
                disabled={sending || !profile?.gmail_access_token || !p}
                className="btn-primary text-xs py-2 px-3"
              >
                {sending ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Envoi...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    <span className="hidden sm:inline">Envoyer la réponse</span>
                    <span className="sm:hidden">Envoyer</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-6 space-y-5">

        {/* ═══════════ Hero card prospect ═══════════ */}
        {q && s && temp && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-card">

            {/* Top : score + identité */}
            <div className="px-6 py-6 border-b border-[#F3F4F6] flex items-start gap-5">
              <ScoreRing score={s.score} temperature={s.temperature} />

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-xl font-extrabold text-navy tracking-tight">{fullName || prospect.email_from_name || 'Prospect'}</h1>
                  <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${temp.cls}`}>
                    {temp.label}
                  </span>
                  <StatusPill status={prospect.status} />
                  {q.is_couple && (
                    <span className="text-[10px] font-bold text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded border border-[#E5E7EB] uppercase tracking-wider">
                      Couple
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B7280] mb-3">
                  Emprunteur · {cityFromAddress ?? q.address ?? 'Localisation à préciser'}
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">{s.explanation}</p>
              </div>
            </div>

            {/* Contact */}
            {(q.email || q.phone) && (
              <div className="px-6 py-3 bg-[#F7F8FA] border-b border-[#F3F4F6] flex flex-wrap items-center gap-5 text-xs">
                {q.phone && (
                  <a href={`tel:${q.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-[#374151] hover:text-navy font-semibold transition-colors">
                    <I.Phone />
                    {q.phone}
                  </a>
                )}
                {q.email && (
                  <a href={`mailto:${q.email}`} className="flex items-center gap-1.5 text-[#374151] hover:text-navy font-semibold transition-colors">
                    <I.Mail />
                    {q.email}
                  </a>
                )}
              </div>
            )}

            {/* Bancabilité — KPIs bancaires */}
            {(q.monthly_income || q.down_payment || q.employment_status) && (
              <div className="px-6 py-5 border-b border-[#F3F4F6]">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Bancabilité</p>
                  <button
                    onClick={() => setEditingQual(true)}
                    className="text-[11px] font-semibold text-[#6B7280] hover:text-navy transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Corriger
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {q.monthly_income && (
                    <div className="border-l-2 border-emerald-200 pl-3">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Revenus mensuels</p>
                      <p className="text-lg font-extrabold text-navy tabular-nums leading-tight">{q.monthly_income.toLocaleString('fr-FR')} {currency}</p>
                      {q.is_couple && <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-medium">Foyer</p>}
                    </div>
                  )}
                  {q.down_payment && (
                    <div className="border-l-2 border-emerald-200 pl-3">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Apport</p>
                      <p className="text-lg font-extrabold text-navy tabular-nums leading-tight">{q.down_payment.toLocaleString('fr-FR')} {currency}</p>
                      {downPaymentPct !== null && (
                        <p className={`text-[10px] font-bold mt-0.5 tabular-nums ${downPaymentPct >= 20 ? 'text-emerald-700' : downPaymentPct >= 10 ? 'text-amber-700' : 'text-red-600'}`}>
                          {downPaymentPct}% du prix
                        </p>
                      )}
                    </div>
                  )}
                  {q.employment_status && (
                    <div className="border-l-2 border-emerald-200 pl-3">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Situation pro</p>
                      <p className="text-lg font-extrabold text-navy leading-tight">{EMPLOYMENT_LABEL[q.employment_status]}</p>
                    </div>
                  )}
                  {q.existing_debts_monthly !== null && q.existing_debts_monthly !== undefined && (
                    <div className="border-l-2 border-emerald-200 pl-3">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Crédits en cours</p>
                      <p className="text-lg font-extrabold text-navy tabular-nums leading-tight">
                        {q.existing_debts_monthly === 0 ? 'Aucun' : `${q.existing_debts_monthly.toLocaleString('fr-FR')} ${currency}/m`}
                      </p>
                      {debtRatio !== null && q.existing_debts_monthly > 0 && (
                        <p className={`text-[10px] font-bold mt-0.5 tabular-nums ${debtRatio < 10 ? 'text-emerald-700' : debtRatio < 25 ? 'text-amber-700' : 'text-red-600'}`}>
                          Endettement {debtRatio}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile emprunteur */}
            <div className="px-6 py-5 border-b border-[#F3F4F6]">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-4">Profil emprunteur</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {[
                  { label: 'Bien ciblé', value: q.propertyType },
                  { label: 'Localisation', value: q.address },
                  { label: 'Surface', value: q.surface ? `${q.surface} m²` : null },
                  { label: 'Pièces', value: q.rooms },
                  { label: 'Budget / Prix', value: q.price ? `${q.price.toLocaleString('fr-FR')} ${currency}` : null, tabular: true },
                  { label: 'Délai d\'achat', value: q.purchase_timeline ? TIMELINE_LABEL[q.purchase_timeline] : null },
                  { label: 'Financement', value: q.financing_status ? FINANCING_LABEL[q.financing_status] : null },
                ].filter(f => f.value !== null && f.value !== undefined && f.value !== '').map((f, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">{f.label}</p>
                    <p className={`text-sm font-semibold text-navy ${f.tabular ? 'tabular-nums' : ''}`}>{f.value}</p>
                  </div>
                ))}
              </div>

              {(q.urgencySignals?.length ?? 0) > 0 && (
                <div className="mt-5 pt-4 border-t border-[#F3F4F6]">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Signaux d&apos;urgence</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(q.urgencySignals ?? []).map((sig, i) => (
                      <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scoring factors */}
            {(s.keyFactors?.length ?? 0) > 0 && (
              <div className="px-6 py-4 bg-[#F7F8FA]">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2.5">Facteurs de scoring</p>
                <div className="flex flex-wrap gap-1.5">
                  {(s.keyFactors ?? []).map((f, i) => (
                    <span key={i} className="text-xs bg-white text-[#374151] border border-[#E5E7EB] px-2 py-0.5 rounded-md font-semibold tabular-nums">
                      <span className="text-emerald-600 font-bold">+{f.points}</span> · {f.factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ Tabs ═══════════ */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-card">

          {/* Tabs nav */}
          <div className="flex border-b border-[#E5E7EB] overflow-x-auto bg-[#F7F8FA]">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => t.enabled && setTab(t.id as Tab)}
                disabled={!t.enabled}
                className={`relative flex-1 min-w-[110px] py-3.5 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                  tab === t.id
                    ? 'text-navy bg-white'
                    : t.enabled
                      ? 'text-[#6B7280] hover:text-navy hover:bg-white/50'
                      : 'text-[#D1D5DB] cursor-not-allowed'
                }`}
              >
                {t.label}
                {t.badge && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    t.badge === 'urgent' ? 'bg-amber-100 text-amber-700' :
                    t.badge === 'manuel' ? 'bg-slate-100 text-slate-500' :
                    'bg-accent/10 text-accent'
                  }`}>
                    {t.badge}
                  </span>
                )}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gradient" />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6">

            {/* ─── Vue d'ensemble ─── */}
            {tab === 'overview' && (
              <div className="space-y-4">
                {prospect.email_body ? (
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 py-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Email original reçu</span>
                      {prospect.received_at && (
                        <span className="text-[10px] text-[#9CA3AF] tabular-nums">
                          {new Date(prospect.received_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      )}
                    </div>
                    {prospect.email_subject && (
                      <div className="px-4 py-2 border-b border-[#F3F4F6] bg-white">
                        <p className="text-sm font-bold text-navy">{prospect.email_subject}</p>
                      </div>
                    )}
                    <div className="px-4 py-3 bg-white">
                      <pre className="text-sm text-[#374151] whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto">
                        {prospect.email_body}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#D1D5DB] rounded-xl px-4 py-8 text-center">
                    <p className="text-sm text-[#6B7280]">Prospect ajouté manuellement — pas d&apos;email d&apos;origine.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Communication ─── */}
            {tab === 'communication' && p && (
              <div className="space-y-6">

                {/* Réponse email */}
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Réponse à envoyer</p>
                    <p className="text-[10px] text-[#9CA3AF] font-medium">Modifiable avant envoi</p>
                  </div>

                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">

                    {/* Destinataire */}
                    <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 py-2 flex items-baseline gap-3">
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider w-10 shrink-0">À</span>
                      <span className="text-sm text-[#374151]">
                        <span className="font-semibold">{fullName ?? prospect.email_from_name ?? 'destinataire'}</span>
                        {prospect.email_from && (
                          <span className="text-[#9CA3AF] ml-1.5">&lt;{prospect.email_from}&gt;</span>
                        )}
                      </span>
                    </div>

                    {/* Objet */}
                    <div className="border-b border-[#F3F4F6] px-4 py-2 flex items-baseline gap-3">
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider w-10 shrink-0">Objet</span>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="flex-1 text-sm font-semibold text-navy bg-transparent focus:outline-none placeholder-[#9CA3AF]"
                        placeholder="Objet de l'email"
                      />
                    </div>

                    {/* Corps */}
                    <textarea
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-4 text-sm text-[#374151] leading-relaxed focus:outline-none resize-y font-sans placeholder-[#9CA3AF]"
                      placeholder="Corps de l'email"
                    />
                  </div>

                  {/* Actions sous l'email */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={sendReply}
                        disabled={sending || prospect.status === 'replied' || !profile?.gmail_access_token || !prospect.email_from}
                        className="btn-primary text-sm py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Envoi en cours...
                          </>
                        ) : prospect.status === 'replied' ? (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Déjà répondu
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"/>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                            Envoyer depuis Gmail
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditedSubject(p.email.subject)
                          setEditedBody(p.email.body)
                        }}
                        className="text-xs text-[#6B7280] hover:text-navy transition-colors font-medium"
                        title="Restaurer la version originale"
                      >
                        Restaurer la version originale
                      </button>
                    </div>
                    <button onClick={copyEmail} className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-navy transition-colors font-medium">
                      <I.Copy />
                      {copied ? 'Copié' : 'Copier'}
                    </button>
                  </div>

                  {/* Statut Gmail */}
                  {!profile?.gmail_access_token && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                      <a href="/pro/sources" className="font-bold underline">Connectez Gmail</a> pour envoyer directement, ou copiez le texte ci-dessus.
                    </div>
                  )}
                  {profile?.gmail_access_token && !prospect.email_from && (
                    <div className="mt-3 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#6B7280]">
                      Pas d&apos;adresse email pour ce prospect — copiez le texte pour l&apos;envoyer manuellement.
                    </div>
                  )}
                </div>

                {/* Briefing appel */}
                {p.callScript && (
                  <div>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3">Briefing d&apos;appel</p>
                    <div className="space-y-3">
                      {p.callScript.briefing && (
                        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                          <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 py-2">
                            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Contexte</span>
                          </div>
                          <div className="px-4 py-3 bg-white">
                            <p className="text-sm font-medium text-navy leading-relaxed">{p.callScript.briefing}</p>
                          </div>
                        </div>
                      )}
                      {p.callScript.need && (
                        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                          <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 py-2">
                            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Besoin du prospect</span>
                          </div>
                          <div className="px-4 py-3 bg-white">
                            <p className="text-sm text-[#374151] leading-relaxed">{p.callScript.need}</p>
                          </div>
                        </div>
                      )}
                      {p.callScript.keyQuestion && (
                        <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/30">
                          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Question d&apos;ouverture</span>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-sm text-[#374151] leading-relaxed italic">« {p.callScript.keyQuestion} »</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'communication' && !p && (
              <div className="border border-dashed border-[#D1D5DB] rounded-xl px-4 py-8 text-center">
                <p className="text-sm text-[#6B7280]">Aucune communication générée. Prospect ajouté manuellement.</p>
              </div>
            )}

            {/* ─── Banques ─── */}
            {tab === 'banks' && (
              <BankTracker prospectId={prospect.id} initialBanks={prospect.bank_submitted} qualification={prospect.qualification} />
            )}

            {/* ─── Historique ─── */}
            {tab === 'history' && (
              <div className="space-y-5">
                <NotesEditor prospectId={prospect.id} initialNotes={prospect.broker_notes} />

                {documents && (
                  <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                    <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Documents à demander</span>
                      <div className="flex items-center gap-3 text-[10px] font-semibold">
                        <span className="flex items-center gap-1 text-[#6B7280]">
                          <I.MapPin />
                          {JURISDICTION_LABEL[documents.jurisdiction]}
                        </span>
                        {documents.urgency === 'urgent' && (
                          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <I.Spark />
                            Compromis signé
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {documents.groups.map((group, gi) => (
                        <div key={gi} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                          <div className="bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 py-2">
                            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{group.category}</span>
                          </div>
                          <ul className="divide-y divide-[#F3F4F6]">
                            {group.items.map((item, ii) => (
                              <li key={ii} className="px-4 py-3 flex items-start gap-3 hover:bg-[#F7F8FA] transition-colors">
                                <span className={`mt-0.5 shrink-0 ${item.required ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>
                                  <I.Circle />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <p className="text-sm font-medium text-navy leading-snug">{item.name}</p>
                                    {!item.required && (
                                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Optionnel</span>
                                    )}
                                  </div>
                                  {item.hint && (
                                    <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{item.hint}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ActivityTimeline activity={prospect.activity} createdAt={prospect.created_at} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Toasts ── */}
      {sentToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border-2 border-emerald-300 text-navy rounded-xl px-4 py-3 shadow-[0_8px_40px_rgba(5,150,105,0.16)] max-w-sm reveal flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-bold">Réponse envoyée</p>
            <p className="text-xs text-[#6B7280] mt-0.5">à {prospect.email_from}</p>
          </div>
        </div>
      )}

      {sendError && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border-2 border-red-300 text-navy rounded-xl px-4 py-3 shadow-lg max-w-sm reveal">
          <p className="text-sm font-bold text-red-700 mb-0.5">Envoi échoué</p>
          <p className="text-xs text-[#6B7280]">{sendError}</p>
        </div>
      )}

      {/* ── Modale d'édition qualification ── */}
      {editingQual && prospect?.qualification && (
        <EditQualificationModal
          prospectId={prospect.id}
          qualification={prospect.qualification}
          onClose={() => setEditingQual(false)}
          onSaved={(updated) => {
            setProspect(prev => prev ? { ...prev, qualification: updated } : prev)
            setEditingQual(false)
          }}
        />
      )}
    </div>
  )
}
