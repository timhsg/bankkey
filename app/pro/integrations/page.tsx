'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  /pro/integrations — Webhook ingestion + form widget
//  Comment recevoir des leads depuis CRM, Zapier, formulaire web, etc.
// ════════════════════════════════════════════════════════════════════════

interface Profile {
  ingest_key: string | null
}

export default function IntegrationsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [appUrl]              = useState(typeof window !== 'undefined' ? window.location.origin : 'https://bankkey.ch')
  const [copied, setCopied]   = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/pro/login'); return }
      const { data } = await supabase.from('profiles').select('ingest_key').single()
      setProfile(data)
      setLoading(false)
    }
    void load()
  }, [supabase, router])

  function copy(label: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  async function regenerateKey() {
    if (!confirm('Régénérer la clé désactivera l\'ancienne. Vos intégrations en cours devront être mises à jour. Continuer ?')) return
    setRegenerating(true)
    const newKey = 'ik_' + crypto.randomUUID().replace(/-/g, '')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setRegenerating(false); return }
    await supabase.from('profiles').update({ ingest_key: newKey }).eq('id', user.id)
    setProfile({ ingest_key: newKey })
    setRegenerating(false)
  }

  async function sendTest() {
    if (!profile?.ingest_key) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(`${appUrl}/api/ingest/${profile.ingest_key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Webhook',
          email: 'test@bankkey.ch',
          phone: '06 00 00 00 00',
          address: 'Lyon centre',
          price: 350000,
          monthly_income: 4500,
          down_payment: 50000,
          message: 'Lead de test envoyé depuis l\'interface BankKey. Vous pouvez l\'archiver après vérification.',
          _source: 'embed-widget',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestResult(`✓ Lead créé (id: ${data.prospect_id?.slice(0, 8)}…). Allez sur Prospects pour le voir.`)
      } else {
        setTestResult(`✗ ${data.error ?? 'Erreur inconnue'}`)
      }
    } catch (err) {
      setTestResult(`✗ ${err instanceof Error ? err.message : 'Erreur réseau'}`)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  const webhookUrl = profile?.ingest_key ? `${appUrl}/api/ingest/${profile.ingest_key}` : ''
  const embedScript = profile?.ingest_key
    ? `<script src="${appUrl}/embed.js" data-key="${profile.ingest_key}"></script>`
    : ''

  return (
    <div className="min-h-screen">

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight pl-12 lg:pl-0">Intégrations</h1>
          <p className="text-[11px] text-slate-500 mt-0.5 pl-12 lg:pl-0">Recevez des prospects depuis n&apos;importe quelle source</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* ═══ URL Webhook personnelle ═══ */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Votre URL webhook personnelle</h2>
          <p className="text-xs text-slate-500 mb-4 max-w-2xl">
            Cette URL est unique à votre cabinet. Envoyez-y n&apos;importe quel JSON depuis votre CRM, Zapier, Make, formulaire web — BankKey qualifie automatiquement et le lead apparaît dans votre tableau de bord.
          </p>

          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden">
            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">POST</span>
                <button
                  onClick={() => copy('url', webhookUrl)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded transition-base"
                >
                  {copied === 'url' ? '✓ Copié' : 'Copier'}
                </button>
              </div>
              <code className="block text-xs font-mono break-all text-emerald-300 leading-relaxed">{webhookUrl}</code>
            </div>
            <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
              <button
                onClick={sendTest}
                disabled={testing}
                className="text-xs bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white px-3 py-1.5 rounded transition-base"
              >
                {testing ? 'Envoi...' : 'Tester avec un lead de démo'}
              </button>
              <button
                onClick={regenerateKey}
                disabled={regenerating}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Régénérer la clé
              </button>
            </div>
            {testResult && (
              <div className={`px-5 py-3 text-xs ${testResult.startsWith('✓') ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                {testResult}
              </div>
            )}
          </div>
        </section>

        {/* ═══ Exemples d'intégration ═══ */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Modes d&apos;intégration courants</h2>

          <div className="space-y-3">

            {/* cURL */}
            <ExampleCard
              title="cURL — test rapide depuis votre terminal"
              code={`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Marie",
    "lastName": "Lefèvre",
    "email": "marie@exemple.fr",
    "phone": "06 12 34 56 78",
    "address": "Lyon",
    "price": 320000,
    "monthly_income": 4500,
    "down_payment": 50000,
    "message": "Recherche financement résidence principale"
  }'`}
              onCopy={(code) => copy('curl', code)}
              copied={copied === 'curl'}
            />

            {/* Zapier */}
            <ExampleCard
              title="Zapier"
              description="Configurez un Zap avec votre source (CRM, Gmail, formulaire) → action 'Webhook POST'. Collez l'URL ci-dessus et passez les champs de votre source en JSON."
              steps={[
                'Créez un nouveau Zap',
                'Choisissez votre source (Gmail, Aprico, HubSpot, etc.)',
                'Action : "Webhooks by Zapier" → "POST"',
                `URL : ${webhookUrl}`,
                'Payload Type : JSON',
                'Mappez vos champs vers : firstName, lastName, email, phone, price, message…',
                'Activez le Zap',
              ]}
            />

            {/* WordPress */}
            <ExampleCard
              title="Formulaire WordPress (WPForms, Contact Form 7, Gravity)"
              description="Utilisez un plugin de webhook pour envoyer chaque soumission vers BankKey :"
              steps={[
                'WPForms → "Webhooks" addon → URL = votre URL BankKey',
                'Contact Form 7 → "CF7 to Webhook" plugin → même chose',
                'Gravity Forms → "Webhooks Add-On" intégré',
                'Mappez les champs vers : firstName, lastName, email, phone, message',
              ]}
            />

            {/* Aprico / Inspirim / autres CRMs */}
            <ExampleCard
              title="CRM courtage (Aprico, Inspirim, Pretto Connect, Marketis)"
              description="Si votre CRM expose un système de webhooks ou intégrations sortantes :"
              steps={[
                'Dans votre CRM, créez une intégration "webhook sortant"',
                'Trigger : "Nouveau lead créé"',
                `URL : ${webhookUrl}`,
                'BankKey accepte tous les formats de payload (auto-détection des champs)',
                'Si votre CRM n\'a pas de webhook, utilisez Zapier comme pont',
              ]}
            />

            {/* Embed widget */}
            <ExampleCard
              title="Formulaire embed sur votre site web"
              code={embedScript}
              description="Collez ce code dans votre site (WordPress, Wix, Webflow, Squarespace…). Un formulaire BankKey natif apparaît, les leads vont directement dans votre tableau de bord."
              onCopy={(code) => copy('embed', code)}
              copied={copied === 'embed'}
            />

            {/* WhatsApp Business via Make */}
            <ExampleCard
              title="WhatsApp Business via Make"
              description="Pour ingérer les messages WhatsApp Business automatiquement :"
              steps={[
                'Make.com → Nouveau scenario',
                'Trigger : "WhatsApp Business - New Message"',
                `Action : "HTTP - Make a request" POST vers ${webhookUrl}`,
                'Body JSON : { "fullName": "{{whatsapp_sender_name}}", "phone": "{{whatsapp_sender}}", "message": "{{whatsapp_text}}" }',
                'Activez le scenario',
              ]}
            />
          </div>
        </section>

        {/* Format JSON accepté */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Champs JSON reconnus</h2>
          <p className="text-xs text-slate-500 mb-3">
            BankKey accepte n&apos;importe quelle clé et reconnaît automatiquement les noms courants (français et anglais).
          </p>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">Champ BankKey</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-500">Alias acceptés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <FieldRow label="firstName" aliases="firstname, prenom, given_name" />
                <FieldRow label="lastName"  aliases="lastname, nom, family_name, surname" />
                <FieldRow label="fullName"  aliases="fullname, name, contact_name (auto-split si firstName/lastName absents)" />
                <FieldRow label="email"     aliases="email, mail, courriel" />
                <FieldRow label="phone"     aliases="phone, telephone, mobile, tel" />
                <FieldRow label="address"   aliases="address, adresse, city, ville, location" />
                <FieldRow label="price"     aliases="price, budget, amount, montant, loan_amount (accepte '350 000 €', '350k')" />
                <FieldRow label="monthly_income" aliases="income, revenus, monthly_income, salaire" />
                <FieldRow label="down_payment"   aliases="apport, down_payment, deposit" />
                <FieldRow label="employment_status" aliases="employment, profession, situation_pro (CDI, fonctionnaire, indépendant, etc.)" />
                <FieldRow label="message"   aliases="message, description, notes, commentaire, details" />
              </tbody>
            </table>
          </div>
        </section>

        {/* Sécurité */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">🔐 Sécurité</h3>
          <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
            <li>• Votre clé est <strong>secrète</strong> — partagez-la uniquement avec vos outils d&apos;intégration.</li>
            <li>• Quiconque possède cette URL peut envoyer des leads dans votre tableau de bord (sans lire vos données existantes).</li>
            <li>• Si vous suspectez une fuite, cliquez « Régénérer la clé » — l&apos;ancienne sera invalidée immédiatement.</li>
            <li>• Limite anti-abus : 100 leads / heure par cabinet.</li>
          </ul>
        </section>

      </main>
    </div>
  )
}

// ── Helpers UI ───────────────────────────────────────────────────────

function ExampleCard({ title, description, steps, code, onCopy, copied }: {
  title: string
  description?: string
  steps?: string[]
  code?: string
  onCopy?: (code: string) => void
  copied?: boolean
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      {steps && (
        <ol className="px-5 py-3 space-y-1.5 list-decimal list-inside text-xs text-slate-700">
          {steps.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
        </ol>
      )}
      {code && (
        <div className="bg-slate-900 text-slate-100 px-4 py-3 relative">
          <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all">{code}</pre>
          {onCopy && (
            <button
              onClick={() => onCopy(code)}
              className="absolute top-2 right-2 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-base"
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FieldRow({ label, aliases }: { label: string; aliases: string }) {
  return (
    <tr>
      <td className="px-4 py-2 font-mono font-semibold text-slate-900">{label}</td>
      <td className="px-4 py-2 text-slate-500">{aliases}</td>
    </tr>
  )
}
