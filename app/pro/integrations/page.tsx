'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseCsv, suggestMapping, type ParsedCsv } from '@/lib/ingest/csv-parser'

// ════════════════════════════════════════════════════════════════════════
//  /pro/integrations — 3 chemins simples + section avancée
//
//  Philosophie : 90% des courtiers ne sont pas tech.
//  → Mettre en avant les solutions où ils n'ont rien à comprendre.
// ════════════════════════════════════════════════════════════════════════

interface Profile {
  ingest_key: string | null
}

type Path = 'website' | 'csv' | 'email' | 'advanced'

export default function IntegrationsPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePath, setActivePath] = useState<Path>('website')
  const appUrl = useMemo(() => typeof window !== 'undefined' ? window.location.origin : 'https://bankkey.ch', [])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">

      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <h1 className="text-base font-semibold text-slate-900 tracking-tight pl-12 lg:pl-0">Recevoir des prospects</h1>
          <p className="text-[11px] text-slate-500 mt-0.5 pl-12 lg:pl-0">Choisissez la méthode qui correspond à votre cabinet</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Pickup : 3 chemins principaux + 1 avancé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PathCard
            id="website"
            active={activePath === 'website'}
            onClick={() => setActivePath('website')}
            icon={(
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="14" x="3" y="5" rx="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <circle cx="6" cy="7" r="0.5" fill="currentColor"/>
              </svg>
            )}
            title="Sur mon site web"
            desc="Un formulaire BankKey qui apparaît directement sur votre site. Une ligne de code à coller."
            difficulty="Facile"
            time="3 min"
          />
          <PathCard
            id="csv"
            active={activePath === 'csv'}
            onClick={() => setActivePath('csv')}
            icon={(
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            )}
            title="Importer un fichier"
            desc="Excel ou CSV. Parfait pour migrer votre liste de prospects existante."
            difficulty="Très facile"
            time="2 min"
          />
          <PathCard
            id="email"
            active={activePath === 'email'}
            onClick={() => setActivePath('email')}
            icon={(
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            )}
            title="Mes emails Gmail"
            desc="Connexion sécurisée. BankKey lit vos emails entrants automatiquement."
            difficulty="Facile"
            time="1 min"
          />
        </div>

        {/* Contenu détaillé selon le chemin choisi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          {activePath === 'website' && profile?.ingest_key && (
            <WebsiteEmbedPath appUrl={appUrl} ingestKey={profile.ingest_key} />
          )}
          {activePath === 'csv' && (
            <CsvImportPath />
          )}
          {activePath === 'email' && (
            <EmailPath />
          )}
        </div>

        {/* Section avancée repliée */}
        <details className="bg-white border border-slate-200 rounded-2xl group">
          <summary className="cursor-pointer px-5 py-4 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <div>
                <p className="font-semibold text-slate-900">Options avancées — Webhook API</p>
                <p className="text-xs text-slate-500 mt-0.5">Pour Zapier, Make, CRM avec intégration sortante</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tech</span>
          </summary>
          <div className="px-5 pb-5 pt-2">
            {profile?.ingest_key && <AdvancedWebhookPath appUrl={appUrl} ingestKey={profile.ingest_key} />}
          </div>
        </details>

      </main>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Chemin 1 : Formulaire sur leur site
// ════════════════════════════════════════════════════════════════════════

function WebsiteEmbedPath({ appUrl, ingestKey }: { appUrl: string; ingestKey: string }) {
  const [copied, setCopied] = useState(false)
  const code = `<script src="${appUrl}/embed.js" data-key="${ingestKey}"></script>`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Formulaire BankKey sur votre site</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Un bouton apparaît automatiquement en bas à droite de votre site. Quand un visiteur clique, un formulaire de demande de financement s&apos;ouvre. Le lead arrive dans votre tableau de bord, déjà qualifié.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Étapes (3 min)</p>
        <ol className="space-y-2.5 text-sm text-slate-700 list-decimal list-inside">
          <li>Copiez la ligne de code ci-dessous</li>
          <li>Collez-la dans votre site web :
            <ul className="mt-1.5 ml-6 text-xs text-slate-500 space-y-0.5 list-disc list-inside">
              <li><strong>WordPress</strong> : Apparence → Personnaliser → Code CSS/JS → coller en bas</li>
              <li><strong>Wix</strong> : Paramètres → Code personnalisé → Ajouter du code</li>
              <li><strong>Webflow</strong> : Paramètres du projet → Custom Code → Footer Code</li>
              <li><strong>Squarespace</strong> : Paramètres → Code Injection → Footer</li>
              <li><strong>Site fait main</strong> : juste avant la balise <code className="bg-slate-200 px-1 rounded text-[10px]">{`</body>`}</code></li>
            </ul>
          </li>
          <li>Sauvegardez et publiez votre site</li>
          <li>Le bouton "Demande de financement" apparaît automatiquement</li>
        </ol>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Code à coller</p>
        <div className="bg-blue-900 text-emerald-300 rounded-xl px-4 py-3 relative">
          <code className="text-xs font-mono break-all">{code}</code>
          <button
            onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2500) }}
            className="absolute top-2 right-2 text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-base"
          >
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Vous n&apos;avez pas de site ?</strong>
          {' '}Demandez à votre webmaster ou utilisez l&apos;import CSV / la connexion Gmail.
        </p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Chemin 2 : Import CSV
// ════════════════════════════════════════════════════════════════════════

function CsvImportPath() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [dragOver, setDragOver] = useState(false)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [runScoring, setRunScoring] = useState(true)

  function onFile(file: File) {
    setError(null)
    setResult(null)
    if (!file.name.match(/\.(csv|tsv|txt)$/i)) {
      setError('Format non supporté. Utilisez CSV (export Excel).')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const result = parseCsv(text)
      if (result.headers.length === 0 || result.rows.length === 0) {
        setError('Fichier vide ou illisible.')
        return
      }
      setParsed(result)
      setMapping(suggestMapping(result.headers))
    }
    reader.readAsText(file)
  }

  async function doImport() {
    if (!parsed) return
    setImporting(true)
    setError(null)

    // Construit les lignes mappées
    const mappedRows = parsed.rows.map(row => {
      const mapped: Record<string, string> = {}
      for (const [csvCol, bankKeyField] of Object.entries(mapping)) {
        if (!bankKeyField || !row[csvCol]) continue
        mapped[bankKeyField] = row[csvCol]
      }
      return mapped
    }).filter(r => Object.keys(r).length > 0)

    try {
      const res = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: mappedRows, runScoring }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ imported: data.imported, skipped: data.skipped, total: data.total })
      } else {
        setError(data.error ?? 'Erreur d\'import')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setImporting(false)
    }
  }

  const BANKKEY_FIELDS = [
    { value: '',          label: '— Ne pas importer —' },
    { value: 'firstName', label: 'Prénom' },
    { value: 'lastName',  label: 'Nom' },
    { value: 'fullName',  label: 'Nom complet (sera divisé)' },
    { value: 'email',     label: 'Email' },
    { value: 'phone',     label: 'Téléphone' },
    { value: 'address',   label: 'Adresse / Ville' },
    { value: 'price',     label: 'Budget / Montant projet' },
    { value: 'monthly_income', label: 'Revenus mensuels' },
    { value: 'down_payment',   label: 'Apport' },
    { value: 'employment_status', label: 'Situation pro' },
    { value: 'message',   label: 'Notes / Commentaires' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Importer un fichier Excel ou CSV</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Migrez votre liste de prospects existante depuis Excel, un CRM ou un export.
          BankKey reconnaît automatiquement les colonnes courantes (prénom, email, téléphone, etc.).
        </p>
      </div>

      {!parsed && !result && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) onFile(file)
          }}
          className={`block border-2 border-dashed rounded-xl px-6 py-12 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-900 bg-slate-50' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <svg className="w-10 h-10 text-slate-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p className="text-sm font-semibold text-slate-900 mb-1">Glissez votre fichier ici</p>
          <p className="text-xs text-slate-500">ou cliquez pour parcourir · CSV, TSV, ou TXT</p>
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={(e) => e.target.files && e.target.files[0] && onFile(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}

      {parsed && !result && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-900">✓ {parsed.rows.length} ligne{parsed.rows.length > 1 ? 's' : ''} détectée{parsed.rows.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-emerald-700 mt-0.5">{parsed.headers.length} colonnes · séparateur "{parsed.separator}"</p>
            </div>
            <button onClick={() => { setParsed(null); setMapping({}) }} className="text-xs text-emerald-700 hover:text-emerald-900 underline">
              Choisir un autre fichier
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Correspondance des colonnes</p>
            <p className="text-xs text-slate-500 mb-3">Vérifiez que chaque colonne CSV est correctement associée à un champ BankKey.</p>
            <div className="space-y-2">
              {parsed.headers.map(header => (
                <div key={header} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-slate-900 truncate">{header}</p>
                    <p className="text-[10px] text-slate-500">Exemple : {parsed.rows[0]?.[header]?.slice(0, 50) ?? '(vide)'}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <select
                    value={mapping[header] ?? ''}
                    onChange={(e) => setMapping(m => ({ ...m, [header]: e.target.value }))}
                    className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 shrink-0 w-48"
                  >
                    {BANKKEY_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={runScoring}
                onChange={(e) => setRunScoring(e.target.checked)}
                className="mt-1 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">Calculer le score de bancabilité pour chaque ligne</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active l&apos;analyse IA — recommandé pour identifier les prospects prioritaires.
                  Désactivez pour un import rapide sans coût IA.
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {Object.values(mapping).filter(v => v).length} colonne(s) seront importées
            </p>
            <button
              onClick={doImport}
              disabled={importing || Object.values(mapping).filter(v => v).length === 0}
              className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-base"
            >
              {importing ? `Import en cours... (${parsed.rows.length} lignes)` : `Importer ${parsed.rows.length} prospect${parsed.rows.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <svg className="w-10 h-10 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-base font-semibold text-emerald-900 mb-1">Import terminé</p>
          <p className="text-sm text-emerald-700 mb-3">
            {result.imported} prospect{result.imported > 1 ? 's' : ''} importé{result.imported > 1 ? 's' : ''}
            {result.skipped > 0 && ` · ${result.skipped} ignoré${result.skipped > 1 ? 's' : ''} (données insuffisantes)`}
          </p>
          <a href="/pro/prospects" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-base">
            Voir mes prospects
          </a>
          <button
            onClick={() => { setParsed(null); setResult(null); setMapping({}) }}
            className="ml-3 text-sm text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            Importer un autre fichier
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Chemin 3 : Email Gmail
// ════════════════════════════════════════════════════════════════════════

function EmailPath() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-1">Connexion Gmail</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          BankKey lit vos emails entrants en lecture seule. Dès qu&apos;un lead arrive
          (Empruntis, SeLoger, contact direct), il est qualifié automatiquement.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Comment ça marche</p>
        <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
          <li>Vous cliquez sur "Connecter Gmail" ci-dessous</li>
          <li>Google vous demande l&apos;autorisation — vous validez</li>
          <li>BankKey scanne vos derniers emails automatiquement (toutes les 24h)</li>
          <li>Les leads Empruntis, SeLoger, Pretto et messages directs sont reconnus automatiquement</li>
          <li>Spams, newsletters et notifications sont filtrés</li>
        </ol>
      </div>

      <a
        href="/api/gmail/connect"
        className="inline-flex items-center justify-center gap-3 w-full bg-white border border-slate-300 hover:border-slate-400 text-slate-900 font-medium px-5 py-3 rounded-lg transition-base"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Connecter mon Gmail
      </a>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Outlook 365 ?</strong>
          {' '}Bientôt disponible. Pour le moment, vous pouvez créer une règle Gmail "Récupérer le courrier" depuis votre compte Outlook.
        </p>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Section avancée : Webhook
// ════════════════════════════════════════════════════════════════════════

function AdvancedWebhookPath({ appUrl, ingestKey }: { appUrl: string; ingestKey: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const webhookUrl = `${appUrl}/api/ingest/${ingestKey}`

  function copy(label: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        Pour les utilisateurs techniques : intégrez votre CRM, Zapier, Make ou tout autre système
        qui peut envoyer un POST JSON.
      </p>

      <div className="bg-blue-900 text-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">URL Webhook POST</span>
          <button onClick={() => copy('url', webhookUrl)} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-base">
            {copied === 'url' ? '✓ Copié' : 'Copier'}
          </button>
        </div>
        <code className="text-xs font-mono text-emerald-300 break-all">{webhookUrl}</code>
      </div>

      <div className="text-xs text-slate-600 space-y-1">
        <p><strong>Champs JSON acceptés</strong> (auto-mapping insensible à la casse) :</p>
        <p className="font-mono text-[11px] bg-slate-100 rounded px-2 py-1">
          firstName, lastName, email, phone, address, price, monthly_income, down_payment, employment_status, message
        </p>
      </div>

      <p className="text-xs text-slate-500">
        Limite : 100 leads / heure / cabinet. Régénérez la clé en cas de fuite.
      </p>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  PathCard
// ════════════════════════════════════════════════════════════════════════

function PathCard({ id, active, onClick, icon, title, desc, difficulty, time }: {
  id: Path
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
  difficulty: string
  time: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-base ${
        active
          ? 'bg-blue-900 text-white border-blue-900 shadow-lg'
          : 'bg-white border-slate-200 hover:border-slate-300 hover-lift'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
        active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
      }`}>
        {icon}
      </div>
      <p className={`text-sm font-semibold mb-1 ${active ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      <p className={`text-xs leading-relaxed mb-3 ${active ? 'text-slate-300' : 'text-slate-500'}`}>{desc}</p>
      <div className="flex items-center gap-2">
        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
          active ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'
        }`}>{difficulty}</span>
        <span className={`text-[10px] ${active ? 'text-slate-400' : 'text-slate-500'}`}>{time}</span>
      </div>
    </button>
  )
}
