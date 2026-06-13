'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { LogoMark } from '@/app/_components/Logo'

// ─────────────────────────────────────────────────────────────
// /book — Réservation de démonstration
// Même langage visuel que la landing : blanc, gradient brand,
// Inter bold, bordure accent sur la card pricing-like.
// ─────────────────────────────────────────────────────────────

function generateUpcomingSlots(): string[] {
  const slots: string[] = []
  const now = new Date()
  const dayLabels   = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const monthLabels = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  let dayOffset = 0
  while (slots.length < 10 && dayOffset < 21) {
    const day = new Date(now)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() + dayOffset)
    const weekday = day.getDay()
    if (weekday >= 1 && weekday <= 5) {
      const isToday = dayOffset === 0
      const dateLabel = `${dayLabels[weekday]} ${day.getDate()} ${monthLabels[day.getMonth()]}`
      const cap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)
      const morningPossible   = !isToday || now.getHours() < 11
      const afternoonPossible = !isToday || now.getHours() < 17
      if (morningPossible)   slots.push(`${cap} — matin (9h–12h)`)
      if (afternoonPossible) slots.push(`${cap} — après-midi (14h–18h)`)
    }
    dayOffset++
  }
  return slots
}

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)

const Check = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function BookPage() {
  const SLOTS = useMemo(generateUpcomingSlots, [])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agencyName: '',
    city: '',
    preferredSlot: SLOTS[0],
    message: '',
  })

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erreur' }))
        throw new Error(err.error ?? 'Erreur')
      }

      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#0A0F1E] antialiased">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="wrap h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-bold text-[15px] tracking-tight text-navy">BankKey</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-[#374151] hover:text-navy transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">

        {/* Halo subtle */}
        <div className="absolute inset-x-0 top-0 h-[500px] hero-glow pointer-events-none" />

        {done ? (
          /* ── État de succès ── */
          <div className="relative wrap max-w-2xl py-20">
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-10 text-center shadow-[0_8px_40px_rgba(5,150,105,0.08)]">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tightest mb-3 text-[#0A0F1E]">
                Demande reçue.
              </h1>
              <p className="text-[#6B7280] leading-relaxed mb-8 max-w-md mx-auto">
                Merci {form.firstName}. Vous serez recontacté{form.firstName?.endsWith('e') ? 'e' : ''} sous 24 h ouvrées au{' '}
                <span className="font-semibold text-[#0A0F1E]">{form.phone}</span> pour confirmer votre créneau.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/demo" className="btn-ghost">
                  Revoir la démo
                </Link>
                <Link href="/" className="btn-primary">
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          </div>

        ) : (
          /* ── Formulaire ── */
          <div className="relative wrap py-16 md:py-20">

            <div className="text-center mb-12">
              <div className="badge mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Démonstration personnalisée
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4 leading-[1.05]">
                20 minutes pour voir<br />
                <span className="text-gradient">BankKey en direct.</span>
              </h1>
              <p className="text-lg text-[#6B7280] max-w-xl mx-auto leading-relaxed">
                On vous montre comment BankKey traite vos propres emails entrants. Pas de discours commercial — juste votre situation analysée en live.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">

              {/* Formulaire — 3 colonnes */}
              <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-2xl p-7 md:p-8 shadow-card space-y-5">

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Prénom" value={form.firstName} onChange={v => update('firstName', v)} required />
                  <Input label="Nom"    value={form.lastName}  onChange={v => update('lastName',  v)} />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Email professionnel" type="email" value={form.email} onChange={v => update('email', v)} required placeholder="vous@cabinet-courtage.fr" />
                  <Input label="Téléphone"           type="tel"   value={form.phone} onChange={v => update('phone', v)} required placeholder="06 12 34 56 78" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Nom du cabinet" value={form.agencyName} onChange={v => update('agencyName', v)} required placeholder="Cabinet Dupont Courtage" />
                  <Input label="Ville"          value={form.city}       onChange={v => update('city', v)}       placeholder="Genève, Lyon, Paris..." />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#374151] mb-1.5 block">
                    Créneau préféré
                  </label>
                  <select
                    value={form.preferredSlot}
                    onChange={(e) => update('preferredSlot', e.target.value)}
                    className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm text-[#0A0F1E] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all bg-white"
                  >
                    {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-xs text-[#9CA3AF] mt-1.5">Confirmation par téléphone sous 24 h ouvrées.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#374151] mb-1.5 block">
                    Quelques précisions <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={3}
                    placeholder="Combien de demandes de financement recevez-vous par mois ? Quels outils utilisez-vous actuellement ?"
                    className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50"
                >
                  {submitting ? 'Envoi en cours...' : (
                    <>
                      Réserver ma démonstration
                      <ArrowRight />
                    </>
                  )}
                </button>

                <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
                  En soumettant ce formulaire, vous acceptez d&apos;être contacté par notre équipe.<br />
                  Vos données ne sont utilisées que pour cet échange.
                </p>
              </form>

              {/* Bénéfices latéral — 2 colonnes */}
              <aside className="lg:col-span-2 space-y-4">

                <div className="card border-2 border-accent shadow-[0_8px_40px_rgba(59,95,224,0.08)]">
                  <p className="label mb-2">Ce qui vous attend</p>
                  <h3 className="font-extrabold text-lg text-[#0A0F1E] mb-4">Une démo, vraiment utile.</h3>

                  <ul className="space-y-3 text-sm">
                    {[
                      { title: '20 minutes maximum', desc: 'Une démo focalisée, sans blabla' },
                      { title: 'Sur vos propres emails', desc: 'On analyse 2 ou 3 demandes réelles' },
                      { title: 'Aucun commercial', desc: 'Échange direct avec le fondateur' },
                      { title: 'Sans engagement', desc: 'Aucune pression, aucune carte' },
                    ].map((b) => (
                      <li key={b.title} className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </span>
                        <div>
                          <p className="font-semibold text-[#0A0F1E]">{b.title}</p>
                          <p className="text-xs text-[#6B7280]">{b.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card bg-[#F7F8FA] border-[#E5E7EB]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#0A0F1E] mb-1">Vos données sont protégées</p>
                      <p className="text-xs text-[#6B7280] leading-relaxed">Hébergement à Francfort. Conformité RGPD. Aucune information stockée sans votre accord explicite.</p>
                    </div>
                  </div>
                </div>

              </aside>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// ── Input réutilisable ─────────────────────────────────────────────

function Input({
  label, value, onChange, required, type = 'text', placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#374151] mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm text-[#0A0F1E] placeholder:text-[#9CA3AF] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
      />
    </div>
  )
}
