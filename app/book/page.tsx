'use client'

import { useState } from 'react'
import Link from 'next/link'

const SLOTS = [
  'Lundi matin (9h-12h)',
  'Lundi après-midi (14h-18h)',
  'Mardi matin (9h-12h)',
  'Mardi après-midi (14h-18h)',
  'Mercredi matin (9h-12h)',
  'Mercredi après-midi (14h-18h)',
  'Jeudi matin (9h-12h)',
  'Jeudi après-midi (14h-18h)',
  'Vendredi matin (9h-12h)',
  'Vendredi après-midi (14h-18h)',
]

export default function BookPage() {
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
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            ← Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">

        {done ? (
          /* ── État de succès ── */
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center animate-fade-up">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-3">
              Demande reçue.
            </h1>
            <p className="text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
              Merci {form.firstName}. Nous vous contactons sous 24h ouvrées au <span className="font-medium text-slate-900">{form.phone}</span> pour confirmer le créneau.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/demo" className="text-sm font-medium border border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2 rounded-lg transition-colors">
                Revoir la démo
              </Link>
              <Link href="/" className="text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors">
                Retour à l&apos;accueil
              </Link>
            </div>
          </div>

        ) : (
          /* ── Formulaire ── */
          <div>
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Démo personnalisée</p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
                Réservez 20 minutes avec notre équipe
              </h1>
              <p className="text-slate-600 max-w-xl mx-auto">
                On vous montre BankKey en direct sur vos propres emails. Pas de commercial, pas de discours marketing — juste une démo concrète.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-7 space-y-5">

              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Prénom"  value={form.firstName} onChange={v => update('firstName', v)} required />
                <Input label="Nom"     value={form.lastName}  onChange={v => update('lastName',  v)} />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Email professionnel" type="email" value={form.email} onChange={v => update('email', v)} required placeholder="vous@cabinet-courtage.fr" />
                <Input label="Téléphone"           type="tel"   value={form.phone} onChange={v => update('phone', v)} required placeholder="06 12 34 56 78" />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Nom du cabinet" value={form.agencyName} onChange={v => update('agencyName', v)} required placeholder="Cabinet Dupont Courtage" />
                <Input label="Ville"          value={form.city}       onChange={v => update('city', v)}       placeholder="Genève, Lyon, Paris..." />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Créneau préféré
                </label>
                <select
                  value={form.preferredSlot}
                  onChange={(e) => update('preferredSlot', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                >
                  {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">Confirmation par téléphone sous 24h.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
                  Quelques précisions (optionnel)
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={3}
                  placeholder="Combien de leads recevez-vous par mois ? Quels outils utilisez-vous actuellement ?"
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none placeholder-slate-300"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Envoi...' : 'Réserver ma démo'}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                En soumettant, vous acceptez d&apos;être contacté par notre équipe. Vos données ne sont utilisées que pour cet échange.
              </p>
            </form>

            {/* Bénéfices */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[
                { title: '20 minutes', desc: 'Démo focalisée, pas de blabla' },
                { title: 'Vos vrais emails', desc: 'On analyse 2-3 de vos demandes réelles' },
                { title: 'Sans engagement', desc: 'Aucun commercial, aucune pression' },
              ].map((b, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-center">
                  <p className="text-sm font-semibold text-slate-900 mb-1">{b.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Input réutilisable ─────────────────────────────────────────────────

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
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder-slate-300"
      />
    </div>
  )
}
