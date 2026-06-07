'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
    if (step === 'profile') {
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

  const currentIdx = STEPS.findIndex(s => s.id === step)
  const progress = ((currentIdx + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/pro" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <Link href="/pro" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            Passer
          </Link>
        </div>
        <div className="h-px bg-slate-100">
          <div
            className="h-px bg-slate-900 transition-all duration-500"
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
                  i <= currentIdx ? 'bg-slate-900' : 'bg-slate-200'
                }`} />
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < currentIdx ? 'bg-slate-900' : 'bg-slate-200'}`} />}
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

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
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
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-base"
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
                <div className="bg-slate-900 text-white rounded-2xl p-5">
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
                  Vous recevrez vos premiers prospects qualifiés dès qu&apos;un email arrive. Vous pouvez explorer la démo en attendant.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                <Link href="/pro" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-base">
                  Mon tableau de bord
                </Link>
                <Link href="/demo" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-base">
                  Explorer la démo
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
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-base"
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
        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder-slate-300"
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
