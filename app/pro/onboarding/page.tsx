'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogoMark } from '@/app/_components/Logo'
import { createClient } from '@/lib/supabase/client'
import type { BrokerMemory } from '@/types'

// ════════════════════════════════════════════════════════════════════════
//  Onboarding wizard — première connexion
//  Étapes : Bienvenue → Profil cabinet → Source de leads → Prêt
// ════════════════════════════════════════════════════════════════════════

type Step = 'welcome' | 'profile' | 'source' | 'done'

const STEPS: { id: Step; label: string }[] = [
  { id: 'welcome', label: 'Bienvenue' },
  { id: 'profile', label: 'Cabinet' },
  { id: 'source',  label: 'Sources' },
  { id: 'done',    label: 'Prêt' },
]

function OnboardingContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  const [step, setStep]               = useState<Step>('welcome')
  const [memory, setMemory]           = useState<BrokerMemory>({
    fullName: '',
    agencyName: '',
    signaturePhone: '',
    tone: 'formal',
    vouvoiement: true,
  })
  const [forwardingAddress, setForwardingAddress] = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [copied, setCopied]           = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const error = searchParams.get('error')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('broker_memory, forwarding_address')
        .single()

      if (data?.broker_memory) {
        setMemory(prev => ({ ...prev, ...data.broker_memory }))
      }
      if (data?.forwarding_address) {
        setForwardingAddress(data.forwarding_address)
      }
    }
    void load()
  }, [supabase, router])

  async function saveProfile() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('profiles')
      .update({ broker_memory: { ...memory, updatedAt: new Date().toISOString() } })
      .eq('id', user.id)
    setSaving(false)
  }

  async function next() {
    setValidationError(null)
    if (step === 'profile') {
      if (!memory.agencyName?.trim()) {
        setValidationError('Veuillez entrer le nom de votre cabinet.')
        return
      }
      if (!memory.fullName?.trim()) {
        setValidationError('Veuillez entrer votre prénom et nom.')
        return
      }
      await saveProfile()
    }
    const idx = STEPS.findIndex(s => s.id === step)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id)
  }

  function back() {
    const idx = STEPS.findIndex(s => s.id === step)
    if (idx > 0) setStep(STEPS[idx - 1].id)
  }

  function copyForwarding() {
    if (!forwardingAddress) return
    navigator.clipboard.writeText(forwardingAddress).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const [demoCreated, setDemoCreated] = useState(false)
  const [demoCreating, setDemoCreating] = useState(false)

  async function createDemoProspect() {
    setDemoCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setDemoCreating(false); return }

    // Prospect démo réaliste : Camille Martin, score 87
    const qualification = {
      type: 'acheteur', firstName: 'Camille', lastName: 'Martin',
      email: 'camille.martin@exemple.fr', phone: '06 12 34 56 78',
      contactInfo: null,
      propertyType: 'Appartement T4', address: 'Genève centre',
      surface: 95, rooms: 4, price: 850000,
      monthly_income: 5800, down_payment: 170000, existing_debts_monthly: 0,
      employment_status: 'cdi', is_couple: true,
      sell_timeline: null, purchase_timeline: 'less_3_months', financing_status: 'in_progress',
      description: 'EXEMPLE — Couple CDI Genève, compromis signé, recherche financement urgent',
      motivationSignals: ['compromis signé'], urgencySignals: ['compromis signé', 'délai serré'],
    }
    const scoring = {
      score: 87, temperature: 'hot',
      explanation: 'EXEMPLE — Profil très solide : couple CDI à Genève, apport de 20%, compromis déjà signé.',
      keyFactors: [
        { factor: 'CDI stable', impact: 'positive', points: 25 },
        { factor: 'Apport ≥ 20%', impact: 'positive', points: 25 },
        { factor: 'Aucun endettement', impact: 'positive', points: 20 },
        { factor: 'Compromis signé', impact: 'positive', points: 17 },
      ],
    }
    const prospection = {
      email: {
        subject: 'Votre demande de financement à Genève',
        body: `Bonjour Camille,\n\nMerci pour votre demande. Au vu de votre profil (CDI, apport solide, compromis signé), votre dossier est très bancable.\n\nPouvons-nous échanger 15 minutes dans la journée pour démarrer ?\n\n[SIGNATURE]`,
      },
      callScript: {
        briefing: 'Couple Genève, CDI, 170k CHF d\'apport, compromis signé sur appartement 850k CHF.',
        need: 'Démarrer un financement rapidement pour respecter le délai compromis.',
        keyQuestion: 'Quelle est la date d\'authentique chez le notaire ?',
      },
    }

    await supabase.from('prospects').insert({
      user_id: user.id,
      source: 'demo',
      sector: 'credit',
      email_from_name: 'Camille Martin',
      email_from: 'camille.martin@exemple.fr',
      email_subject: 'EXEMPLE — Demande financement Genève',
      email_body: 'Bonjour,\n\nMon mari et moi venons de signer un compromis pour un appartement à Genève centre (850 000 CHF). Nous disposons de 170 000 CHF d\'apport et sommes tous les deux en CDI (revenus combinés 5800 CHF/mois).\n\nPouvez-vous nous accompagner dans la recherche de financement ?\n\nBonne journée,\nCamille',
      qualification, scoring, prospection,
      detected_source: { sourceId: 'demo', sourceName: 'Exemple', confidence: 'high', method: 'manual' },
      status: 'new',
      received_at: new Date().toISOString(),
      activity: [
        { type: 'email_received', at: new Date().toISOString(), label: 'Email reçu (exemple)' },
        { type: 'qualified',      at: new Date().toISOString(), label: 'Qualifié · score 87/100 (Prioritaire)' },
      ],
    })

    setDemoCreating(false)
    setDemoCreated(true)
  }

  const currentIdx = STEPS.findIndex(s => s.id === step)
  const progress = ((currentIdx + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/pro" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/pro" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Passer
          </Link>
        </div>
        <div className="h-px bg-slate-100">
          <div
            className="h-px bg-blue-900 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-xl animate-fade-up">

          <div className="flex items-center justify-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentIdx ? 'bg-blue-900' : 'bg-slate-200'
                }`} />
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < currentIdx ? 'bg-blue-900' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
              {error === 'oauth_failed'      && 'La connexion Gmail a échoué. Réessayez.'}
              {error === 'token_save_failed' && 'Erreur lors de la sauvegarde. Réessayez.'}
              {!['oauth_failed', 'token_save_failed'].includes(error) && `Erreur : ${error}`}
            </div>
          )}

          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-6">
              {validationError}
            </div>
          )}

          {/* ── STEP : Bienvenue ── */}
          {step === 'welcome' && (
            <div className="text-center space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Bienvenue dans BankKey</p>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
                  Configurons votre cabinet en 3 minutes
                </h1>
                <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                  On va remplir votre profil, connecter une première source de leads, et vous serez prêt à recevoir vos premiers prospects qualifiés automatiquement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { n: '1', t: 'Profil', d: 'Votre signature, votre style' },
                  { n: '2', t: 'Sources', d: 'D\'où viennent vos leads' },
                  { n: '3', t: 'Prêt', d: 'BankKey travaille pour vous' },
                ].map(s => (
                  <div key={s.n} className="bg-white border border-slate-200 rounded-xl p-3 text-left transition-base hover-lift">
                    <p className="text-[10px] font-mono text-slate-400 mb-1">{s.n}</p>
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">{s.t}</p>
                    <p className="text-[11px] text-slate-500 leading-snug">{s.d}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={next}
                className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-base"
              >
                Commencer
              </button>
            </div>
          )}

          {/* ── STEP : Profil ── */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Étape 2 sur 4</p>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Présentez votre cabinet</h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  BankKey utilisera ces informations pour signer vos emails de réponse automatiquement.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <Field
                  label="Votre nom complet"
                  value={memory.fullName ?? ''}
                  onChange={v => setMemory(m => ({ ...m, fullName: v }))}
                  placeholder="Marie Lefèvre"
                  autoFocus
                />
                <Field
                  label="Nom du cabinet"
                  value={memory.agencyName ?? ''}
                  onChange={v => setMemory(m => ({ ...m, agencyName: v }))}
                  placeholder="Cabinet Lefèvre Courtage"
                />
                <Field
                  label="Téléphone professionnel"
                  type="tel"
                  value={memory.signaturePhone ?? ''}
                  onChange={v => setMemory(m => ({ ...m, signaturePhone: v }))}
                  placeholder="04 78 12 34 56"
                />
              </div>

              <p className="text-xs text-slate-400 text-center">
                Vous pourrez ajouter zones, banques partenaires, style… plus tard dans votre profil.
              </p>
            </div>
          )}

          {/* ── STEP : Source ── */}
          {step === 'source' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Étape 3 sur 4</p>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">D&apos;où viennent vos leads ?</h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Connectez Gmail pour ingestion auto, ou utilisez votre adresse BankKey pour faire suivre d&apos;autres plateformes.
                </p>
              </div>

              <a
                href="/api/gmail/connect"
                className="block bg-white border border-slate-200 rounded-2xl p-5 hover-lift transition-base"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 mb-0.5">Connecter Gmail</p>
                    <p className="text-xs text-slate-500">Connexion sécurisée OAuth — BankKey lit en lecture seule</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </a>

              {forwardingAddress && (
                <div className="bg-blue-900 text-white rounded-2xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Ou utilisez votre adresse BankKey</p>
                  <p className="text-base font-mono font-semibold mb-2 break-all">{forwardingAddress}</p>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    Faites suivre les emails de n&apos;importe quelle source (Empruntis, SeLoger, partenaires) vers cette adresse.
                  </p>
                  <button
                    onClick={copyForwarding}
                    className="text-xs bg-white hover:bg-slate-100 text-slate-900 font-medium px-3 py-1.5 rounded-lg transition-base"
                  >
                    {copied ? '✓ Copié' : 'Copier l\'adresse'}
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center">
                Vous pouvez configurer tout cela plus tard depuis l&apos;onglet Sources.
              </p>
            </div>
          )}

          {/* ── STEP : Done ── */}
          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Tout est prêt</p>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
                  Bienvenue dans BankKey{memory.fullName ? `, ${memory.fullName.split(' ')[0]}` : ''}.
                </h1>
                <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
                  Avant d&apos;attaquer, voulez-vous voir un exemple de prospect qualifié dans votre tableau de bord ?
                </p>
              </div>

              {/* Carte option : créer un prospect démo */}
              {!demoCreated && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 mb-1">Voir BankKey rempli</p>
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        On crée un prospect d&apos;exemple (Camille Martin, score 87) dans votre tableau de bord pour vous montrer à quoi ça ressemble. Vous pourrez le supprimer ensuite.
                      </p>
                      <button
                        onClick={createDemoProspect}
                        disabled={demoCreating}
                        className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-base"
                      >
                        {demoCreating ? 'Création...' : 'Créer un prospect d\'exemple'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {demoCreated && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 max-w-md mx-auto">
                  ✓ Prospect d&apos;exemple créé. Vous le trouverez dans votre tableau de bord.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <Link href="/pro" className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-base">
                  Mon tableau de bord
                </Link>
                <Link href="/pro/sources" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-base">
                  Connecter Gmail
                </Link>
              </div>
            </div>
          )}

          {/* Navigation footer */}
          {step !== 'welcome' && step !== 'done' && (
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={back}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={next}
                disabled={saving}
                className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-base"
              >
                {saving ? 'Sauvegarde...' : 'Continuer'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', autoFocus }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all placeholder-slate-300"
      />
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
