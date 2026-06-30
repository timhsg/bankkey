'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogoMark } from '@/app/_components/Logo'
import { createClient } from '@/lib/supabase/client'
import type { BrokerMemory } from '@/types'

// ═══════════════════════════════════════════════════════════════════════
//  /pro/onboarding — Wizard première connexion
//  4 étapes : Bienvenue → Profil cabinet → Source de leads → Prêt
//  Design : split fullscreen, gradient brand à gauche, contenu à droite
// ═══════════════════════════════════════════════════════════════════════

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
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Header progress ── */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/pro" className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-bold text-navy tracking-tight text-sm">BankKey</span>
          </Link>
          <Link href="/pro" className="text-xs text-[#9CA3AF] hover:text-navy transition-colors font-medium">
            Passer pour l&apos;instant
          </Link>
        </div>
        <div className="h-1 bg-[#F3F4F6] relative">
          <div
            className="absolute inset-y-0 left-0 bg-brand-gradient transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-12 bg-[#F7F8FA]">
        <div className="w-full max-w-xl reveal">

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  i < currentIdx ? 'bg-emerald-500 text-white' :
                  i === currentIdx ? 'bg-navy text-white shadow-[0_0_0_4px_rgba(10,31,92,0.12)]' :
                  'bg-white border border-[#E5E7EB] text-[#9CA3AF]'
                }`}>
                  {i < currentIdx ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${i < currentIdx ? 'bg-emerald-500' : 'bg-[#E5E7EB]'}`} />
                )}
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

          {/* ─── STEP : Bienvenue ─── */}
          {step === 'welcome' && (
            <div className="text-center space-y-8">
              <div>
                <div className="badge mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Bienvenue
                </div>
                <h1 className="text-4xl font-extrabold text-navy tracking-tightest mb-4 leading-[1.05]">
                  Votre cabinet,<br />
                  <span className="text-gradient">prêt en 3 minutes.</span>
                </h1>
                <p className="text-[#6B7280] leading-relaxed max-w-md mx-auto">
                  Trois étapes simples : votre profil, votre source de leads, et BankKey commence à qualifier vos prospects automatiquement.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { n: '1', t: 'Profil', d: 'Cabinet et signature' },
                  { n: '2', t: 'Source', d: 'Gmail, Outlook ou transfert' },
                  { n: '3', t: 'Prêt', d: 'BankKey travaille pour vous' },
                ].map(s => (
                  <div key={s.n} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-left hover:shadow-card transition-shadow">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Étape {s.n}</p>
                    <p className="text-sm font-bold text-navy mb-0.5">{s.t}</p>
                    <p className="text-[11px] text-[#6B7280] leading-snug">{s.d}</p>
                  </div>
                ))}
              </div>

              <button onClick={next} className="btn-primary text-sm py-3 px-6">
                Commencer
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ─── STEP : Profil ─── */}
          {step === 'profile' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="label mb-3">Étape 2 sur 4</p>
                <h1 className="text-3xl font-extrabold text-navy tracking-tightest mb-2">Présentez votre cabinet</h1>
                <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                  BankKey utilise ces informations pour signer vos emails de réponse automatiquement.
                </p>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-card">
                <Field
                  label="Votre nom complet"
                  value={memory.fullName ?? ''}
                  onChange={v => setMemory(m => ({ ...m, fullName: v }))}
                  placeholder="Marie Lefèvre"
                  autoFocus
                  required
                />
                <Field
                  label="Nom du cabinet"
                  value={memory.agencyName ?? ''}
                  onChange={v => setMemory(m => ({ ...m, agencyName: v }))}
                  placeholder="Cabinet Lefèvre Courtage"
                  required
                />
                <Field
                  label="Téléphone professionnel"
                  type="tel"
                  value={memory.signaturePhone ?? ''}
                  onChange={v => setMemory(m => ({ ...m, signaturePhone: v }))}
                  placeholder="04 78 12 34 56"
                />
              </div>

              <p className="text-xs text-[#9CA3AF] text-center font-medium">
                Vous pourrez ajouter zones, banques partenaires, style éditorial… plus tard.
              </p>
            </div>
          )}

          {/* ─── STEP : Source ─── */}
          {step === 'source' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="label mb-3">Étape 3 sur 4</p>
                <h1 className="text-3xl font-extrabold text-navy tracking-tightest mb-2">D&apos;où viennent vos demandes ?</h1>
                <p className="text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
                  Connectez Gmail ou Outlook pour l&apos;ingestion automatique, ou utilisez votre adresse BankKey pour transférer depuis d&apos;autres plateformes.
                </p>
              </div>

              <a
                href="/api/gmail/connect"
                className="block bg-white border-2 border-accent rounded-xl p-5 hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F7F8FA] rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy mb-0.5">Connecter Gmail</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">Connexion sécurisée OAuth · Lecture seule</p>
                  </div>
                  <span className="text-xs font-bold text-accent">Recommandé</span>
                </div>
              </a>

              <a
                href="/api/outlook/connect"
                className="block bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-navy hover:shadow-card transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F7F8FA] rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#0078D4" d="M21.66 4H10.34A2.34 2.34 0 0 0 8 6.34v.66H2v11.32A1.68 1.68 0 0 0 3.68 20H17v-3h6.34A2.34 2.34 0 0 0 24 14.66v-8.32A2.34 2.34 0 0 0 21.66 4z"/>
                      <path fill="#fff" d="M21.5 8h-7v8h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5zm-1.5 6h-4v-4h4v4z"/>
                      <circle fill="#0078D4" cx="6.5" cy="13.5" r="3"/>
                      <circle fill="#fff" cx="6.5" cy="13.5" r="1.3"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-navy mb-0.5">Connecter Outlook</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">Microsoft 365 / Outlook.com · Lecture seule</p>
                  </div>
                </div>
              </a>

              {forwardingAddress && (
                <div className="bg-brand-gradient text-white rounded-xl p-5 shadow-[0_8px_32px_rgba(10,31,92,0.16)]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-2">Ou utilisez votre adresse BankKey</p>
                  <p className="text-base font-mono font-bold mb-3 break-all bg-white/10 px-3 py-2 rounded-lg">{forwardingAddress}</p>
                  <p className="text-xs text-blue-100 leading-relaxed mb-3">
                    Faites suivre les emails de n&apos;importe quelle source (Empruntis, SeLoger, partenaires) vers cette adresse.
                  </p>
                  <button
                    onClick={copyForwarding}
                    className="text-xs font-bold bg-white text-navy hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? '✓ Adresse copiée' : 'Copier l\'adresse'}
                  </button>
                </div>
              )}

              <p className="text-xs text-[#9CA3AF] text-center font-medium">
                Vous pourrez aussi configurer cela plus tard depuis l&apos;onglet Sources.
              </p>
            </div>
          )}

          {/* ─── STEP : Done ─── */}
          {step === 'done' && (
            <div className="text-center space-y-7">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-300 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="label mb-3">Configuration terminée</p>
                <h1 className="text-3xl font-extrabold text-navy tracking-tightest mb-3 leading-[1.05]">
                  Bienvenue{memory.fullName ? `, ${memory.fullName.split(' ')[0]}` : ''}.<br />
                  <span className="text-gradient">Votre cabinet est prêt.</span>
                </h1>
                <p className="text-[#6B7280] leading-relaxed max-w-md mx-auto">
                  Avant de démarrer, voulez-vous voir un exemple de prospect qualifié dans votre tableau de bord ?
                </p>
              </div>

              {!demoCreated && (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 text-left max-w-md mx-auto shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-btn">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy mb-1">Voir un exemple de prospect</p>
                      <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
                        On crée un prospect exemple (Camille Martin, score 87) dans votre tableau de bord pour vous montrer à quoi BankKey ressemble en pratique. Vous pourrez le supprimer ensuite.
                      </p>
                      <button
                        onClick={createDemoProspect}
                        disabled={demoCreating}
                        className="btn-primary text-xs py-2 px-3 disabled:opacity-50"
                      >
                        {demoCreating ? 'Création...' : 'Créer le prospect exemple'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {demoCreated && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-800 max-w-md mx-auto flex items-center gap-2 justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span><strong className="font-bold">Prospect créé.</strong> Disponible dans votre tableau de bord.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <Link href="/pro" className="btn-primary text-sm py-2.5 justify-center">
                  Mon tableau de bord
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/pro/sources" className="btn-ghost text-sm py-2.5 justify-center">
                  Connecter ma boîte mail
                </Link>
              </div>
            </div>
          )}

          {/* Footer nav */}
          {step !== 'welcome' && step !== 'done' && (
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={back}
                className="text-sm font-medium text-[#6B7280] hover:text-navy transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={next}
                disabled={saving}
                className="btn-primary text-sm py-2.5 px-5 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Continuer'}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', autoFocus, required }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  autoFocus?: boolean
  required?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[#374151] mb-1.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-sm text-navy placeholder-[#9CA3AF] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
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
