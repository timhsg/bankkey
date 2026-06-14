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

const SCORING_DEFAULT_WEIGHTS = {
  employment_situation: 25,
  down_payment: 25,
  debt_ratio: 20,
  project_maturity: 20,
  contact_completeness: 10,
} as const

type ScoringWeightKey = keyof typeof SCORING_DEFAULT_WEIGHTS
type CompleteScoringWeights = Record<ScoringWeightKey, number>

const SCORING_ITEMS: Array<{
  key: ScoringWeightKey
  label: string
  desc: string
  tone: string
}> = [
  {
    key: 'employment_situation',
    label: 'Situation professionnelle',
    desc: 'Stabilité des revenus : CDI, fonctionnaire, indépendant...',
    tone: 'bg-slate-700',
  },
  {
    key: 'down_payment',
    label: 'Apport personnel',
    desc: 'Capacité du prospect à sécuriser son financement.',
    tone: 'bg-emerald-600',
  },
  {
    key: 'debt_ratio',
    label: 'Endettement actuel',
    desc: 'Poids des crédits existants par rapport aux revenus.',
    tone: 'bg-sky-600',
  },
  {
    key: 'project_maturity',
    label: 'Maturité du projet',
    desc: "Urgence, compromis signé, délai d'achat.",
    tone: 'bg-amber-600',
  },
  {
    key: 'contact_completeness',
    label: 'Contact exploitable',
    desc: 'Email et téléphone disponibles pour rappeler vite.',
    tone: 'bg-violet-600',
  },
]

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function distributeWeights(
  baseWeights: CompleteScoringWeights,
  keys: ScoringWeightKey[],
  targetTotal: number,
): CompleteScoringWeights {
  const next = { ...baseWeights }
  const safeTarget = clampWeight(targetTotal)
  const baseTotal = keys.reduce((sum, key) => sum + Math.max(0, baseWeights[key]), 0)

  if (keys.length === 0) return next

  if (safeTarget === 0) {
    keys.forEach((key) => { next[key] = 0 })
    return next
  }

  if (baseTotal <= 0) {
    const base = Math.floor(safeTarget / keys.length)
    const remainder = safeTarget - base * keys.length
    keys.forEach((key, index) => {
      next[key] = base + (index < remainder ? 1 : 0)
    })
    return next
  }

  const raw = keys.map((key) => {
    const exact = (Math.max(0, baseWeights[key]) / baseTotal) * safeTarget
    return { key, points: Math.floor(exact), fraction: exact - Math.floor(exact) }
  })

  let remainder = safeTarget - raw.reduce((sum, item) => sum + item.points, 0)
  raw
    .sort((a, b) => b.fraction - a.fraction)
    .forEach((item) => {
      if (remainder <= 0) return
      item.points += 1
      remainder -= 1
    })

  raw.forEach((item) => { next[item.key] = item.points })
  return next
}

function getCompleteScoringWeights(weights?: BrokerMemory['scoring_weights']): CompleteScoringWeights {
  const merged = { ...SCORING_DEFAULT_WEIGHTS, ...(weights ?? {}) }
  const sanitized = Object.fromEntries(
    Object.entries(merged).map(([key, value]) => [key, clampWeight(value)])
  ) as CompleteScoringWeights
  const total = Object.values(sanitized).reduce((sum, value) => sum + value, 0)

  if (total === 100) return sanitized
  return distributeWeights(sanitized, Object.keys(SCORING_DEFAULT_WEIGHTS) as ScoringWeightKey[], 100)
}

// Met à jour librement un curseur sans toucher aux autres.
// La normalisation se fait uniquement à la sauvegarde.
function updateScoringWeight(
  weights: CompleteScoringWeights,
  key: ScoringWeightKey,
  value: number,
): CompleteScoringWeights {
  return { ...weights, [key]: clampWeight(value) }
}

// Normalise le total à 100 de façon proportionnelle (appelé avant save)
function normalizeScoringWeights(weights: CompleteScoringWeights): CompleteScoringWeights {
  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  if (total === 100) return weights
  if (total === 0) return { ...SCORING_DEFAULT_WEIGHTS }
  return distributeWeights(weights, Object.keys(SCORING_DEFAULT_WEIGHTS) as ScoringWeightKey[], 100)
}

export default function SettingsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [memory, setMemory]   = useState<BrokerMemory>(EMPTY_MEMORY)
  const [hotNotif, setHotNotif] = useState(true)
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
        .select('broker_memory, email_hot_notifications')
        .single()

      if (data?.broker_memory) {
        setMemory({ ...EMPTY_MEMORY, ...data.broker_memory })
      }
      if (typeof data?.email_hot_notifications === 'boolean') {
        setHotNotif(data.email_hot_notifications)
      }
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  async function save() {
    setSaving(true)
    setSaved(false)

    // Normalise les poids à 100 avant sauvegarde
    const normalizedWeights = memory.scoring_weights
      ? normalizeScoringWeights(getCompleteScoringWeights(memory.scoring_weights))
      : undefined

    const memoryToSave: BrokerMemory = {
      ...memory,
      ...(normalizedWeights ? { scoring_weights: normalizedWeights } : {}),
    }
    if (normalizedWeights) setMemory(m => ({ ...m, scoring_weights: normalizedWeights }))

    await supabase
      .from('profiles')
      .update({
        broker_memory: { ...memoryToSave, updatedAt: new Date().toISOString() },
        email_hot_notifications: hotNotif,
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
        <div className="w-5 h-5 border-2 border-slate-200 border-t-navy rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">

      {/* Header avec actions */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 py-5 flex items-end justify-between gap-4">
          <div className="pl-12 lg:pl-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">Configuration</p>
            <h1 className="text-2xl font-extrabold text-navy tracking-tightest leading-none">Mon profil</h1>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-10 space-y-6">

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
                      ? 'bg-navy text-white border-blue-900'
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
              className={`relative w-10 h-5 rounded-full transition-colors ${memory.vouvoiement === false ? 'bg-slate-200' : 'bg-navy'}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${memory.vouvoiement === false ? 'left-0.5' : 'left-5'}`}
              />
            </button>
          </div>
        </Section>

        {/* ── Section: Pondération scoring ── */}
        <Section title="Scoring personnalisé" desc="Ajustez librement l'importance de chaque critère. La normalisation à 100 se fait automatiquement à la sauvegarde.">
          {(() => {
            const weights = getCompleteScoringWeights(memory.scoring_weights)
            const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
            const isBalanced = total === 100
            return (
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Répartition du score</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isBalanced
                          ? 'Équilibré. Chaque curseur est indépendant — aucun autre ne bouge quand vous en touchez un.'
                          : 'Total ≠ 100 — sera normalisé automatiquement à la sauvegarde.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isBalanced && (
                        <button
                          onClick={() => update('scoring_weights', normalizeScoringWeights(weights))}
                          className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Normaliser
                        </button>
                      )}
                      <span className={`text-sm font-semibold tabular-nums px-2.5 py-1 rounded-lg ${
                        isBalanced ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {total}/100
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    {SCORING_ITEMS.map((item) => (
                      <div
                        key={item.key}
                        className={`${item.tone} transition-all duration-300`}
                        style={{ width: `${total > 0 ? (weights[item.key] / total) * 100 : 20}%` }}
                        title={`${item.label} : ${weights[item.key]} pts`}
                      />
                    ))}
                  </div>
                </div>

                {SCORING_ITEMS.map(item => {
                  const value = weights[item.key]
                  return (
                    <div key={item.key} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
                            <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-900 tabular-nums">
                          {value} pts
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={value}
                        onChange={(e) => update('scoring_weights', updateScoringWeight(weights, item.key, Number(e.target.value)))}
                        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-900
                                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                   [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                                   [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2
                                   [&::-webkit-slider-thumb]:border-blue-900 [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>
                  )
                })}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => update('scoring_weights', undefined)}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Réinitialiser les valeurs par défaut
                  </button>
                </div>
              </div>
            )
          })()}
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

        {/* ── Section: Notifications ── */}
        <div id="notifications" className="scroll-mt-20">
          <Section title="Notifications" desc="Recevez un email quand un prospect chaud arrive — pour rappeler vite et signer plus.">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
              <div className="pr-4">
                <p className="text-sm font-medium text-slate-900">Alerte email lead chaud</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Envoi immédiat dès qu'un prospect obtient un score ≥ 70. Une seule alerte par prospect.
                </p>
              </div>
              <button
                onClick={() => setHotNotif(v => !v)}
                aria-pressed={hotNotif}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${hotNotif ? 'bg-emerald-600' : 'bg-slate-200'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${hotNotif ? 'left-5' : 'left-0.5'}`}
                />
              </button>
            </div>
          </Section>
        </div>

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
              className="text-xs bg-navy hover:opacity-90 disabled:bg-slate-300 text-white px-5 py-2 rounded-lg transition-colors font-medium"
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
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder-slate-300"
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
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none placeholder-slate-300 leading-relaxed"
      />
      {hint && <p className="text-[11px] text-slate-400 mt-1.5">{hint}</p>}
    </div>
  )
}
