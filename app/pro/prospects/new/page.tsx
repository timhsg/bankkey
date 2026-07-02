'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { activityEmailReceived } from '@/lib/activity'

// ════════════════════════════════════════════════════════════════════════
//  /pro/prospects/new — Création manuelle d'un prospect
//  Pour les prospects qui ne viennent PAS d'un email :
//  recommandation, agence, téléphone, rendez-vous direct, ancien client...
// ════════════════════════════════════════════════════════════════════════

const SOURCES = [
  { value: 'referral',  label: 'Recommandation',   desc: 'Client ou contact qui m\'a recommandé' },
  { value: 'agency',    label: 'Agence partenaire', desc: 'Agent immobilier ou autre apporteur' },
  { value: 'phone',     label: 'Téléphone',         desc: 'Appel entrant direct' },
  { value: 'walkin',    label: 'Rendez-vous direct', desc: 'Prospect venu au cabinet' },
  { value: 'social',    label: 'Réseaux sociaux',   desc: 'LinkedIn, Instagram, Facebook' },
  { value: 'returning', label: 'Ancien client',     desc: 'Renouvellement ou nouveau projet' },
  { value: 'event',     label: 'Salon / événement', desc: 'Rencontre lors d\'un événement' },
  { value: 'other',     label: 'Autre',             desc: 'Source non listée' },
]

const EMPLOYMENT = [
  { value: 'cdi',           label: 'CDI' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'cdd',           label: 'CDD / Intérim' },
  { value: 'independant',   label: 'Indépendant' },
  { value: 'retraite',      label: 'Retraité(e)' },
  { value: 'sans_emploi',   label: 'Sans emploi' },
]

export default function NewProspectPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    source:           'referral',
    firstName:        '',
    lastName:         '',
    email:            '',
    phone:            '',
    address:          '',
    is_couple:        false,
    employment:       'cdi',
    monthly_income:   '',
    down_payment:     '',
    existing_debts:   '',
    project_amount:   '',
    property_type:    '',
    notes:            '',
  })

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/pro/login'); return }

    const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || 'Prospect manuel'
    const sourceLabel = SOURCES.find(s => s.value === form.source)?.label ?? form.source

    // Construction de la qualification "manuelle"
    const qualification = {
      type: 'acheteur' as const,
      firstName: form.firstName || null,
      lastName: form.lastName || null,
      email: form.email || null,
      phone: form.phone || null,
      contactInfo: null,
      propertyType: form.property_type || null,
      address: form.address || null,
      surface: null,
      rooms: null,
      price: form.project_amount ? Number(form.project_amount) : null,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
      down_payment: form.down_payment ? Number(form.down_payment) : null,
      existing_debts_monthly: form.existing_debts ? Number(form.existing_debts) : null,
      employment_status: (form.employment as 'cdi' | 'fonctionnaire' | 'cdd' | 'independant' | 'retraite' | 'sans_emploi'),
      is_couple: form.is_couple,
      sell_timeline: null,
      purchase_timeline: null,
      financing_status: null,
      description: `Dossier ajouté manuellement · Source : ${sourceLabel}${form.notes ? `\n\n${form.notes}` : ''}`,
      motivationSignals: [],
      urgencySignals: [],
    }

    const { data: inserted, error: insertError } = await supabase
      .from('prospects')
      .insert({
        user_id: user.id,
        source: 'manual',
        sector: 'credit',
        email_from_name: fullName,
        email_from: form.email || null,
        email_subject: `Dossier manuel · ${fullName}`,
        email_body: form.notes || null,
        qualification,
        scoring: null,  // Sera calculé à la demande
        prospection: null,
        detected_source: { sourceId: 'manual', sourceName: sourceLabel, confidence: 'high', method: 'manual' },
        status: 'new',
        broker_notes: form.notes || null,
        received_at: new Date().toISOString(),
        activity: [activityEmailReceived(sourceLabel)],
      })
      .select('id')
      .single()

    setSubmitting(false)

    if (insertError || !inserted) {
      setError(`La création a échoué : ${insertError?.message ?? 'erreur inconnue'}. Réessayez.`)
      return
    }

    router.push(`/pro/leads/${inserted.id}`)
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/pro/prospects" className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-navy transition-colors pl-12 lg:pl-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
            </svg>
            Prospects
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">Nouveau prospect</p>
          <h1 className="text-3xl font-extrabold text-navy tracking-tightest mb-2">Ajouter un prospect manuellement</h1>
          <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl">
            Pour les prospects qui ne viennent pas d&apos;un email : recommandation, agence partenaire, téléphone, ancien client. Vous pourrez ensuite suivre les banques sollicitées et enregistrer la décision finale comme pour un prospect qualifié par l&apos;IA.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">

          {/* ── Source ── */}
          <Section title="D'où vient ce prospect ?">
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('source', s.value)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-base ${
                    form.source === s.value
                      ? 'bg-navy text-white border-blue-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold mb-0.5">{s.label}</p>
                  <p className={`text-[10px] leading-tight ${form.source === s.value ? 'text-slate-300' : 'text-slate-500'}`}>{s.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* ── Identité ── */}
          <Section title="Identité">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom"  value={form.firstName} onChange={v => set('firstName', v)} placeholder="Marie" required />
              <Input label="Nom"     value={form.lastName}  onChange={v => set('lastName', v)}  placeholder="Lefèvre" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Email"     type="email" value={form.email} onChange={v => set('email', v)} placeholder="marie@email.com" />
              <Input label="Téléphone" type="tel"   value={form.phone} onChange={v => set('phone', v)} placeholder="06 12 34 56 78" />
            </div>
            <Input label="Localisation du projet" value={form.address} onChange={v => set('address', v)} placeholder="Lyon 6e, Genève centre, etc." />
            <Toggle label="Couple emprunteur"     value={form.is_couple} onChange={v => set('is_couple', v)} desc="Cochez si revenus combinés" />
          </Section>

          {/* ── Capacité ── */}
          <Section title="Capacité financière (optionnel)">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Situation professionnelle</label>
              <select
                value={form.employment}
                onChange={(e) => set('employment', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white"
              >
                {EMPLOYMENT.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Revenus mensuels (€)"     type="number" value={form.monthly_income} onChange={v => set('monthly_income', v)} placeholder="4500" />
              <Input label="Apport disponible (€)"    type="number" value={form.down_payment}   onChange={v => set('down_payment', v)}   placeholder="50000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Mensualités crédits actuels (€)" type="number" value={form.existing_debts}   onChange={v => set('existing_debts', v)} placeholder="0" />
              <Input label="Montant du projet (€)"            type="number" value={form.project_amount}   onChange={v => set('project_amount', v)} placeholder="350000" />
            </div>
            <Input label="Type de bien" value={form.property_type} onChange={v => set('property_type', v)} placeholder="Appartement T4, maison, etc." />
          </Section>

          {/* ── Notes ── */}
          <Section title="Notes initiales (optionnel)">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Détails sur le client, contexte, urgence, recommandeur..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent resize-none placeholder-slate-300"
            />
          </Section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/pro/prospects" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-navy hover:opacity-90 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-base"
            >
              {submitting ? 'Création...' : 'Créer le prospect'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

// ── UI Helpers ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent transition-base placeholder-slate-300"
      />
    </div>
  )
}

function Toggle({ label, value, onChange, desc }: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  desc?: string
}) {
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {desc && <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-base ${value ? 'bg-navy' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-base ${value ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  )
}
