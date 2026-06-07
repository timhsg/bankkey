'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { brokerMemoryCompleteness } from '@/lib/broker/memory'
import type { BrokerMemory } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  Settings courtier — édition de la mémoire IA
// ════════════════════════════════════════════════════════════════════════

const EMPTY_MEMORY: BrokerMemory = {
  fullName: '',
  jobTitle: 'Courtier en crédit immobilier',
  agencyName: '',
  agencyAddress: '',
  iobspNumber: '',
  websiteUrl: '',
  signaturePhone: '',
  signatureEmail: '',
  zones: [],
  specialties: [],
  bankPartners: [],
  tone: 'formal',
  vouvoiement: true,
  minIncome: undefined,
  maxProjectAmount: undefined,
  notes: '',
}

export default function SettingsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [memory, setMemory]   = useState<BrokerMemory>(EMPTY_MEMORY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  // Chargement initial
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('broker_memory')
        .single()

      if (data?.broker_memory) {
        setMemory({ ...EMPTY_MEMORY, ...data.broker_memory })
      }
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  async function save() {
    setSaving(true)
    setSaved(false)
    await supabase
      .from('profiles')
      .update({
        broker_memory: { ...memory, updatedAt: new Date().toISOString() }
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function update<K extends keyof BrokerMemory>(key: K, value: BrokerMemory[K]) {
    setMemory(m => ({ ...m, [key]: value }))
  }

  function updateList(key: 'zones' | 'specialties' | 'bankPartners', value: string) {
    update(key, value.split(',').map(s => s.trim()).filter(Boolean))
  }

  const completeness = brokerMemoryCompleteness(memory)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      {/* Header avec actions */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight pl-12 lg:pl-0">Mon profil</h1>
          <button
            onClick={save}
            disabled={saving}
            className="text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-10 space-y-6">

        {/* Intro + jauge */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Mémoire du courtier</p>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
            Votre profil professionnel
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            BankKey utilise ces informations pour personnaliser les réponses email, adapter le ton et signer correctement chaque message.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">Profil complété à</span>
              <span className="text-sm font-semibold text-slate-900 tracking-tight">{completeness}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Section: Identité ── */}
        <Section title="Identité" desc="Comment vous présenter aux prospects">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom complet" value={memory.fullName ?? ''} onChange={v => update('fullName', v)} placeholder="Marie Lefèvre" />
            <Field label="Fonction"    value={memory.jobTitle ?? ''} onChange={v => update('jobTitle', v)} placeholder="Courtière en crédit immobilier" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Nom du cabinet" value={memory.agencyName ?? ''} onChange={v => update('agencyName', v)} placeholder="Cabinet Lefèvre Courtage" />
            <Field label="N° IOBSP (FR)"  value={memory.iobspNumber ?? ''} onChange={v => update('iobspNumber', v)} placeholder="22000123" />
          </div>
          <Field label="Adresse du cabinet" value={memory.agencyAddress ?? ''} onChange={v => update('agencyAddress', v)} placeholder="12 rue de la République, 69002 Lyon" />
          <Field label="Site web"           value={memory.websiteUrl ?? ''}    onChange={v => update('websiteUrl', v)}    placeholder="https://votre-cabinet.fr" />
        </Section>

        {/* ── Section: Contact ── */}
        <Section title="Contact" desc="Affiché dans la signature des emails envoyés">
          <Field label="Téléphone professionnel" value={memory.signaturePhone ?? ''} onChange={v => update('signaturePhone', v)} placeholder="04 78 12 34 56" />
          <Textarea
            label="Signature email personnalisée (optionnel)"
            value={memory.signatureEmail ?? ''}
            onChange={v => update('signatureEmail', v)}
            placeholder={'Marie Lefèvre\nCourtière en crédit immobilier\nCabinet Lefèvre Courtage\nTél. : 04 78 12 34 56\nlefevre-courtage.fr'}
            hint="Si renseigné, remplace la signature auto-générée."
            rows={6}
          />
        </Section>

        {/* ── Section: Spécialisation ── */}
        <Section title="Spécialisation" desc="Aide l'IA à adapter les réponses selon votre périmètre">
          <Field
            label="Zones d'intervention (séparées par des virgules)"
            value={memory.zones?.join(', ') ?? ''}
            onChange={v => updateList('zones', v)}
            placeholder="Lyon centre, Villeurbanne, Lyon 6e"
          />
          <Field
            label="Spécialités (séparées par des virgules)"
            value={memory.specialties?.join(', ') ?? ''}
            onChange={v => updateList('specialties', v)}
            placeholder="Primo-accédants, Investisseurs locatifs, Refinancement"
          />
          <Field
            label="Banques partenaires (séparées par des virgules)"
            value={memory.bankPartners?.join(', ') ?? ''}
            onChange={v => updateList('bankPartners', v)}
            placeholder="BNP Paribas, Crédit Agricole, Caisse d'Épargne"
          />
        </Section>

        {/* ── Section: Style ── */}
        <Section title="Style de communication" desc="L'IA adapte le ton de vos réponses">
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2 block">Ton</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'formal',   label: 'Formel',     desc: 'Professionnel institutionnel' },
                { id: 'friendly', label: 'Chaleureux', desc: 'Personnel et empathique' },
                { id: 'concise',  label: 'Concis',     desc: 'Direct et factuel' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => update('tone', t.id as BrokerMemory['tone'])}
                  className={`text-left p-3 rounded-xl border transition-colors ${
                    memory.tone === t.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-sm font-semibold mb-0.5">{t.label}</p>
                  <p className={`text-[10px] leading-tight ${memory.tone === t.id ? 'text-slate-300' : 'text-slate-400'}`}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
            <div>
              <p className="text-sm font-medium text-slate-900">Vouvoiement</p>
              <p className="text-xs text-slate-500 mt-0.5">Désactivez pour utiliser le tutoiement</p>
            </div>
            <button
              onClick={() => update('vouvoiement', !(memory.vouvoiement ?? true))}
              className={`relative w-10 h-5 rounded-full transition-colors ${memory.vouvoiement === false ? 'bg-slate-200' : 'bg-slate-900'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${memory.vouvoiement === false ? 'left-0.5' : 'left-5'}`}
              />
            </button>
          </div>
        </Section>

        {/* ── Section: Règles métier ── */}
        <Section title="Règles métier (optionnel)" desc="Aide l'IA à filtrer les dossiers hors périmètre">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Revenus minimum acceptés (€/mois)"
              value={memory.minIncome?.toString() ?? ''}
              onChange={v => update('minIncome', v ? Number(v) : undefined)}
              placeholder="2000"
              type="number"
            />
            <Field
              label="Montant max de dossier (€)"
              value={memory.maxProjectAmount?.toString() ?? ''}
              onChange={v => update('maxProjectAmount', v ? Number(v) : undefined)}
              placeholder="2000000"
              type="number"
            />
          </div>
        </Section>

        {/* ── Section: Notes ── */}
        <Section title="Instructions libres" desc="Tout ce que l'IA doit savoir de spécifique à votre cabinet">
          <Textarea
            label=""
            value={memory.notes ?? ''}
            onChange={v => update('notes', v)}
            placeholder="Exemples :&#10;- Toujours proposer un rendez-vous physique avant un appel téléphonique&#10;- Mentionner notre partenariat exclusif avec la Caisse d'Épargne Rhône-Alpes&#10;- Indiquer que le premier rendez-vous est gratuit et sans engagement"
            rows={5}
          />
        </Section>

        {/* Save bar sticky */}
        <div className="sticky bottom-4 z-10">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
            <span className="text-xs text-slate-500">
              {saved ? '✓ Modifications enregistrées' : 'Pensez à sauvegarder vos modifications'}
            </span>
            <button
              onClick={save}
              disabled={saving}
              className="text-xs bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-5 py-2 rounded-lg transition-colors font-medium"
            >
              {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Helpers UI ─────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {desc && <p className="text-xs text-slate-500 mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder-slate-300"
      />
    </div>
  )
}

function Textarea({ label, value, onChange, placeholder, hint, rows = 4 }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  rows?: number
}) {
  return (
    <div>
      {label && <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none placeholder-slate-300 leading-relaxed"
      />
      {hint && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
    </div>
  )
}
