import Link from 'next/link'
import type { Metadata } from 'next'
import { LogoMark, Wordmark } from '@/app/_components/Logo'

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
    title: 'Chiffrement et accès en lecture seule',
    desc: 'TLS 1.3 en transit, base de données chiffrée au repos (AES-256, hébergement UE). L\'accès à votre boîte mail est en lecture seule et révocable à tout moment depuis votre compte Google ou Microsoft.',
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
    title: 'Aucune revente, aucun entraînement de modèles',
    desc: 'Vos emails et prospects ne sont jamais utilisés pour entraîner un modèle. Aucune donnée partagée à des tiers commerciaux.',
  },
]

const SUBPROCESSORS = [
  { name: 'Supabase',  role: 'Hébergement base de données + authentification',  country: 'EU (Francfort)', dpa: true },
  { name: 'Anthropic', role: 'Traitement automatique du langage',                country: 'US — clauses contractuelles types', dpa: true },
  { name: 'Vercel',    role: 'Hébergement de l\'application web',                 country: 'EU (Francfort)', dpa: true },
  { name: 'Resend',    role: 'Envoi d\'emails transactionnels',                  country: 'EU', dpa: true },
  { name: 'Stripe',    role: 'Traitement des paiements',                          country: 'EU (Dublin)', dpa: true },
]

const COMPLIANCE = [
  { name: 'RGPD',      status: 'Conforme',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Registre des traitements, base légale exécution contrat, droits effectifs.' },
  { name: 'IOBSP',     status: 'Compatible',   cls: 'bg-blue-50 text-blue-700 border-blue-200',          desc: 'Archivage 5 ans, traçabilité des conseils, journalisation des actions courtier.' },
  { name: 'SOC 2',     status: 'Roadmap 2026', cls: 'bg-amber-50 text-amber-700 border-amber-200',       desc: 'Audit prévu fin 2026 après croissance de la base client.' },
  { name: 'ISO 27001', status: 'Roadmap 2027', cls: 'bg-slate-100 text-slate-600 border-slate-200',      desc: 'Préparation initiée. Politiques de sécurité formalisées.' },
]

const FLOW = [
  { step: '1', title: 'Réception',  desc: 'BankKey lit votre boîte mail (Gmail, Outlook…) via OAuth en lecture seule. Aucun email n\'est dupliqué.' },
  { step: '2', title: 'Analyse',    desc: 'Le texte est envoyé pour analyse à notre prestataire de traitement du langage. Aucun email n\'est conservé chez lui au-delà de la requête.' },
  { step: '3', title: 'Stockage',   desc: 'Seul le profil structuré (revenus, apport, type de bien…) est stocké dans votre instance Supabase isolée.' },
  { step: '4', title: 'Affichage',  desc: 'Vous accédez aux résultats via une session sécurisée (Supabase Auth), isolée par cabinet.' },
  { step: '5', title: 'Action',     desc: 'Vous validez la réponse pré-rédigée. L\'envoi se fait depuis votre compte Gmail directement, jamais en notre nom.' },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0F1E] antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="wrap h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Wordmark size={24} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#374151]">
            <Link href="/#fonctionnement" className="hover:text-navy transition-colors">Comment ça marche</Link>
            <Link href="/#tarifs" className="hover:text-navy transition-colors">Tarifs</Link>
            <Link href="/security" className="text-navy font-bold">Sécurité</Link>
            <Link href="/#faq" className="hover:text-navy transition-colors">FAQ</Link>
          </nav>
          <Link href="/book" className="btn-primary text-sm py-2.5 px-5">
            Réserver une démonstration
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="hero-glow" />
        <div className="relative wrap max-w-4xl mx-auto py-20 md:py-24 text-center">
          <div className="badge mb-6">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            </svg>
            Sécurité & conformité
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tightest mb-5 leading-[1.05]">
            Vos données restent<br />
            <span className="text-gradient">en Europe.</span>
          </h1>
          <p className="text-base md:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            Les fichiers que vous traitez touchent à la vie privée et à l&apos;argent. BankKey applique les règles que vos clients exigeraient de leur banque : chiffrement, isolation par cabinet, suppression sur demande.
          </p>
        </div>
      </section>

      {/* ── Principes ── */}
      <section className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-20 md:py-24">
        <div className="wrap max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="label mb-3">Engagements</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tightest">Six principes non négociables</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {PRINCIPLES.map((p, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-mono text-accent mt-0.5 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="text-base font-bold text-navy">{p.title}</h3>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed pl-7">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flow ── */}
      <section className="wrap max-w-5xl mx-auto py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="label mb-3">Architecture</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tightest">
            Le flux d&apos;un email,<br />
            <span className="text-gradient">étape par étape.</span>
          </h2>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {FLOW.map((s, i) => (
            <div key={i} className="flex items-start gap-5 bg-white border border-[#E5E7EB] rounded-xl p-5 hover:shadow-card transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-btn">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-navy mb-1">{s.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sous-traitants ── */}
      <section className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-20 md:py-24">
        <div className="wrap max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="label mb-3">Transparence</p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tightest mb-4">Sous-traitants déclarés</h2>
            <p className="text-[#6B7280] max-w-2xl mx-auto">
              Liste exhaustive des prestataires techniques pouvant traiter vos données. Tous ont signé un DPA.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-5 py-3">Prestataire</th>
                  <th className="text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-5 py-3">Rôle</th>
                  <th className="text-left text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-5 py-3">Localisation</th>
                  <th className="text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-widest px-5 py-3">DPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {SUBPROCESSORS.map((s, i) => (
                  <tr key={i} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-5 py-4 font-bold text-navy">{s.name}</td>
                    <td className="px-5 py-4 text-[#374151]">{s.role}</td>
                    <td className="px-5 py-4 text-[#6B7280] text-xs">{s.country}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-4 text-center font-medium">
            Toute modification de cette liste vous sera notifiée par email 30 jours à l&apos;avance.
          </p>
        </div>
      </section>

      {/* ── Conformité ── */}
      <section className="wrap max-w-5xl mx-auto py-20 md:py-24">
        <div className="text-center mb-14">
          <p className="label mb-3">Conformité réglementaire</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tightest">Cadres applicables</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {COMPLIANCE.map((c, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:shadow-card transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-navy text-base">{c.name}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${c.cls}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-[#6B7280] leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact DPO ── */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(59,95,224,0.35), transparent)' }} />

        <div className="relative wrap max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-5">Contact DPO</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tightest mb-4 leading-tight">
            Une question sur la confidentialité ?
          </h2>
          <p className="text-blue-200 leading-relaxed mb-8 max-w-xl mx-auto">
            Le DPO BankKey répond sous 48 h ouvrées. Pour toute demande d&apos;exercice de droits RGPD ou question de sécurité.
          </p>
          <a href="mailto:dpo@bankkey.ch" className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-100 text-navy font-bold px-6 py-3.5 rounded-lg transition-colors text-base shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            dpo@bankkey.ch
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy text-slate-400 py-10 text-xs">
        <div className="wrap flex flex-col md:flex-row items-center justify-between gap-3">
          <p>© 2026 BankKey. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link href="/book" className="hover:text-white transition-colors">Réserver une démo</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
            <a href="mailto:dpo@bankkey.ch" className="hover:text-white transition-colors">DPO</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
