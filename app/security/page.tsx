import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark } from '@/app/_components/Logo'

export const metadata: Metadata = {
  title: 'Sécurité & confidentialité — BankKey',
  description: 'Architecture, chiffrement, conformité RGPD et sous-traitants de BankKey. Conçu pour la confidentialité bancaire européenne.',
}

const PRINCIPLES = [
  {
    title: 'Vous restez propriétaire de vos données',
    desc: 'Vous exportez ou supprimez l\'intégralité de vos données en un clic. Aucune clause de propriété intellectuelle sur les emails ou prospects traités.',
  },
  {
    title: 'Hébergement européen, sans transfert hors UE',
    desc: 'Infrastructure dans l\'Union européenne (Francfort). Aucune réplication ou backup hors UE. Conforme à l\'article 44 du RGPD.',
  },
  {
    title: 'Chiffrement systématique',
    desc: 'TLS 1.3 en transit. AES-256 au repos sur la base de données. Tokens OAuth chiffrés via Supabase Vault avec rotation automatique.',
  },
  {
    title: 'Isolation par cabinet',
    desc: 'Row Level Security PostgreSQL : chaque cabinet ne voit jamais les données d\'un autre, garantie au niveau du moteur de base de données.',
  },
  {
    title: 'Effacement sur demande sous 72 h',
    desc: 'Demande par email à dpo@bankkey.ch. Suppression complète (production + sauvegardes) sous 72 heures ouvrées. Attestation envoyée.',
  },
  {
    title: 'Pas de revente, pas de modèles entraînés sur vos données',
    desc: 'Vos emails et prospects ne sont jamais utilisés pour entraîner un modèle. Aucune donnée partagée à des tiers commerciaux.',
  },
]

const SUBPROCESSORS = [
  { name: 'Supabase',  role: 'Hébergement base de données + auth',          country: 'EU (Francfort)', dpa: true },
  { name: 'Anthropic', role: 'Analyse IA des emails (Claude)',                country: 'US — clauses contractuelles types', dpa: true },
  { name: 'Vercel',    role: 'Hébergement de l\'application web',             country: 'EU (Francfort)', dpa: true },
  { name: 'Resend',    role: 'Envoi d\'emails transactionnels (notifications)', country: 'EU', dpa: true },
  { name: 'Stripe',    role: 'Traitement des paiements (à venir)',            country: 'EU (Dublin)', dpa: true },
]

const COMPLIANCE = [
  { name: 'RGPD',     status: 'Conforme',     desc: 'Registre des traitements, base légale exécution contrat, droits effectifs.' },
  { name: 'IOBSP',    status: 'Compatible',   desc: 'Archivage 5 ans, traçabilité des conseils, journalisation des actions courtier.' },
  { name: 'SOC 2',    status: 'Roadmap 2026', desc: 'Audit prévu fin 2026 après croissance de la base client.' },
  { name: 'ISO 27001', status: 'Roadmap 2027', desc: 'Préparation initiée. Politiques de sécurité formalisées.' },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <Link href="/#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</Link>
            <Link href="/#pricing"  className="hover:text-slate-900 transition-colors">Tarifs</Link>
            <Link href="/security"  className="text-slate-900 font-medium">Sécurité</Link>
            <Link href="/#faq"      className="hover:text-slate-900 transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/pro/login" className="text-sm bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full mb-6">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          </svg>
          Sécurité & conformité
        </div>
        <h1 className="font-semibold text-4xl md:text-5xl tracking-tightest mb-5 leading-[1.05]">
          Vos données restent <br />en Europe.
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Les fichiers que vous traitez touchent à la vie privée et à l&apos;argent. BankKey applique les règles que vos clients exigeraient de leur banque : chiffrement, isolation par cabinet, suppression sur demande.
        </p>
      </section>

      {/* Principes */}
      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 text-center">Engagements</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-14">Six principes non-négociables</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-7">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-base font-semibold text-slate-900">{p.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-7">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 text-center">Architecture</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-14">Le flux d&apos;un email, étape par étape</h2>

        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            { step: '1', title: 'Réception', desc: 'BankKey lit votre email Gmail via OAuth (lecture seule). Aucun email n\'est dupliqué.' },
            { step: '2', title: 'Analyse',   desc: 'Le texte est envoyé à Claude (Anthropic) pour extraction structurée. Aucun email n\'est conservé chez Anthropic au-delà de la requête.' },
            { step: '3', title: 'Stockage',  desc: 'Seul le profil extrait est stocké (revenus, apport, type de bien…) dans votre instance Supabase isolée.' },
            { step: '4', title: 'Affichage', desc: 'Vous accédez aux résultats via une session sécurisée (Supabase Auth). Tokens chiffrés.' },
            { step: '5', title: 'Action',    desc: 'Vous validez la réponse pré-rédigée. L\'envoi se fait depuis votre compte Gmail directement, jamais en notre nom.' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-5 bg-white border border-slate-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sous-traitants */}
      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 text-center">Transparence</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-4">Sous-traitants déclarés</h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Liste exhaustive des prestataires techniques qui peuvent traiter vos données. Tous ont un DPA signé.
          </p>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-5 py-3">Prestataire</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-5 py-3">Rôle</th>
                  <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-5 py-3">Localisation</th>
                  <th className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-5 py-3">DPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUBPROCESSORS.map((s, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4 font-medium text-slate-900">{s.name}</td>
                    <td className="px-5 py-4 text-slate-600">{s.role}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{s.country}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-emerald-600 text-base">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Toute modification de cette liste vous sera notifiée par email 30 jours à l&apos;avance.
          </p>
        </div>
      </section>

      {/* Conformité */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3 text-center">Conformité réglementaire</p>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center mb-14">Cadres applicables</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {COMPLIANCE.map((c, i) => (
            <div key={i} className="border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">{c.name}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  c.status === 'Conforme'   ? 'bg-emerald-50 text-emerald-700' :
                  c.status === 'Compatible' ? 'bg-blue-50 text-blue-700' :
                                              'bg-slate-100 text-slate-600'
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DPO Contact */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Une question sur la confidentialité ?
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            Le DPO BankKey répond sous 48 h ouvrées. Pour toute demande d&apos;exercice de droits RGPD ou question de sécurité.
          </p>
          <a href="mailto:dpo@bankkey.ch" className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-medium px-5 py-2.5 rounded-lg transition-colors text-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            dpo@bankkey.ch
          </a>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-blue-900 border-t border-slate-800 text-slate-400 py-8 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© 2026 BankKey. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/book" className="hover:text-white transition-colors">Réserver une démo</Link>
            <a href="mailto:dpo@bankkey.ch" className="hover:text-white transition-colors">DPO</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
