'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoMark, Wordmark } from '@/app/_components/Logo'
import { BookingCalendar } from '@/app/_components/BookingCalendar'

// ─────────────────────────────────────────────────────────────
// /book — Réservation de démonstration avec calendrier visuel
// ─────────────────────────────────────────────────────────────

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

const FR_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const FR_WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

function formatSlot(slot: { date: string; time: string } | null): string {
  if (!slot) return ''
  const [y, m, d] = slot.date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const weekday = FR_WEEKDAYS[dateObj.getDay()]
  const month = FR_MONTHS[m - 1]
  return `${weekday} ${d} ${month} à ${slot.time}`
}

export default function BookPage() {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null)
  const [showSlotError, setShowSlotError] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agencyName: '',
    city: '',
    message: '',
  })

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowSlotError(false)

    if (!slot) {
      setShowSlotError(true)
      // Scroll to calendar
      document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preferredSlot: formatSlot(slot),
          slotDate: slot.date,
          slotTime: slot.time,
        }),
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
            <Wordmark size={24} />
          </Link>
          <Link href="/" className="text-sm font-medium text-[#374151] hover:text-navy transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[500px] hero-glow pointer-events-none" />

        {done ? (
          /* ───── Confirmation ───── */
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
              <p className="text-[#6B7280] leading-relaxed mb-2 max-w-md mx-auto">
                Merci {form.firstName}. Votre demande a bien été enregistrée pour le
              </p>
              <p className="text-lg font-bold text-navy mb-6 capitalize">
                {formatSlot(slot)}
              </p>
              <p className="text-sm text-[#6B7280] mb-8 max-w-md mx-auto">
                Vous serez recontacté{form.firstName?.endsWith('e') ? 'e' : ''} sous 24 h ouvrées au{' '}
                <span className="font-semibold text-[#0A0F1E] tabular-nums">{form.phone}</span> pour confirmer.
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
          /* ───── Formulaire ───── */
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
                On analyse en live 2 ou 3 de vos demandes réelles. Échange direct avec le fondateur — pas de discours commercial.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-6 max-w-6xl mx-auto">

              {/* ── Colonne calendrier — 3 cols ── */}
              <div id="calendar" className="lg:col-span-3">
                <BookingCalendar value={slot} onChange={setSlot} />

                {showSlotError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Veuillez sélectionner une date et un créneau horaire
                  </div>
                )}
              </div>

              {/* ── Colonne formulaire — 2 cols ── */}
              <div className="lg:col-span-2 space-y-4">

                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card space-y-4">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Vos coordonnées</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Prénom" value={form.firstName} onChange={v => update('firstName', v)} required />
                    <Input label="Nom"    value={form.lastName}  onChange={v => update('lastName',  v)} />
                  </div>

                  <Input
                    label="Email professionnel"
                    type="email"
                    value={form.email}
                    onChange={v => update('email', v)}
                    required
                    placeholder="vous@cabinet-courtage.fr"
                  />

                  <Input
                    label="Téléphone"
                    type="tel"
                    value={form.phone}
                    onChange={v => update('phone', v)}
                    required
                    placeholder="06 12 34 56 78"
                  />

                  <Input
                    label="Nom du cabinet"
                    value={form.agencyName}
                    onChange={v => update('agencyName', v)}
                    required
                    placeholder="Cabinet Dupont Courtage"
                  />

                  <Input
                    label="Ville"
                    value={form.city}
                    onChange={v => update('city', v)}
                    placeholder="Genève, Lyon, Paris..."
                  />

                  <div>
                    <label className="text-xs font-semibold text-[#374151] mb-1.5 block">
                      Quelques précisions <span className="text-[#9CA3AF] font-normal">(optionnel)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      rows={3}
                      placeholder="Combien de demandes recevez-vous par mois ? Quels outils utilisez-vous ?"
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
                    className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Envoi en cours...' : (
                      <>
                        Confirmer la réservation
                        <ArrowRight />
                      </>
                    )}
                  </button>

                  {slot && !showSlotError && (
                    <p className="text-[11px] text-emerald-700 text-center font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-3 h-3" />
                      <span className="capitalize">{formatSlot(slot)}</span>
                    </p>
                  )}

                  <p className="text-[10px] text-[#9CA3AF] text-center leading-relaxed">
                    En soumettant ce formulaire, vous acceptez d&apos;être contacté{form.firstName?.endsWith('e') ? 'e' : ''} par notre équipe.
                  </p>
                </div>

                {/* Card bénéfices */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-card">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Ce qui vous attend</p>
                  <ul className="space-y-2.5 text-sm">
                    {[
                      { title: '20 minutes maximum', desc: 'Démo focalisée, sans blabla' },
                      { title: 'Sur vos propres emails', desc: '2 ou 3 demandes réelles analysées' },
                      { title: 'Sans engagement', desc: 'Aucune carte, aucune pression' },
                    ].map((b) => (
                      <li key={b.title} className="flex items-start gap-2.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        </span>
                        <div>
                          <p className="font-bold text-navy text-[13px] leading-tight">{b.title}</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">{b.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </form>
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
