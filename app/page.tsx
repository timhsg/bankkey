import Link from 'next/link'
import ROICalculator from './_components/ROICalculator'
import PricingSection from './_components/PricingSection'
import HeroPreview from './_components/HeroPreview'
import IntegrationsBar from './_components/IntegrationsBar'
import WorkflowSteps from './_components/WorkflowSteps'
import { CurrencyToggle } from './_components/CurrencyContext'

// ── Inline icons (Lucide-style) ───────────────────────────────────────────

const iconBase = 'w-5 h-5 stroke-[1.5]'

const Icons = {
  Mail: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  Gauge: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  ),
  FileText: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  ),
  Send: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  ),
  Phone: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  Lock: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Shield: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  Database: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  Bolt: () => (
    <svg className={iconBase} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  ),
}

// ── Cell utilisée dans le tableau comparatif ──────────────────────────────

function Cell({ value, accent }: { value: boolean | 'manual' | string; accent?: boolean }) {
  const bgClass = accent ? 'bg-slate-900/5' : '';

  if (value === true) {
    return (
      <td className={`py-3 px-4 text-center ${bgClass}`}>
        <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full ${accent ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
      </td>
    );
  }
  if (value === false) {
    return (
      <td className={`py-3 px-4 text-center ${bgClass}`}>
        <span className="text-slate-300">—</span>
      </td>
    );
  }
  if (value === 'manual') {
    return (
      <td className={`py-3 px-4 text-center ${bgClass}`}>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Manuel</span>
      </td>
    );
  }
  return <td className={`py-3 px-4 text-center text-slate-700 ${bgClass}`}>{value}</td>;
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">

      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <a href="#calculator" className="hover:text-slate-900 transition-colors">ROI</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Fonctionnalités</a>
            <Link href="/security" className="hover:text-slate-900 transition-colors">Sécurité</Link>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline"><CurrencyToggle /></span>
            <Link href="/book" className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Réserver une démo
            </Link>
          </div>
        </div>
      </header>

      {/* ───── Hero avec mockup à droite ───── */}
      <section className="relative overflow-hidden">

        {/* Ambiance fond — gradient subtil */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-br from-emerald-50/40 via-blue-50/30 to-amber-50/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Colonne gauche : titre + sub + CTA */}
            <div className="lg:col-span-5 text-center lg:text-left">

              {/* Mini-badge avec accent chaud */}
              <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Pour cabinets de courtage en crédit immobilier
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.05] mb-6 text-slate-900">
                Répondez en premier
                <span className="block text-slate-500">à chaque demande de financement.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                BankKey lit vos emails, qualifie chaque emprunteur, calcule un score de bancabilité et rédige votre réponse — avant que le prospect n&apos;ait le temps d&apos;appeler un concurrent.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-5">
                <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-base hover-lift w-full sm:w-auto">
                  Réserver une démo
                  <Icons.ArrowRight />
                </Link>
                <Link href="/demo" className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-base w-full sm:w-auto">
                  Voir la démo
                </Link>
              </div>

              {/* Mini stats / proof */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  60 secondes par lead
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  Setup en 10 min
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  30 jours gratuits
                </span>
              </div>
            </div>

            {/* Colonne droite : mockup produit */}
            <div className="lg:col-span-7 relative">
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Bar logos plateformes compatibles */}
      <IntegrationsBar />

      {/* ───── Trust bar (avec icônes colorées chaudes) ───── */}
      <section className="border-y border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Icons.Shield />,   label: 'Conforme RGPD',         color: 'text-emerald-600 bg-emerald-50' },
              { icon: <Icons.Database />, label: 'Hébergé dans l\'UE',     color: 'text-blue-600 bg-blue-50' },
              { icon: <Icons.Lock />,     label: 'Chiffrement TLS + AES', color: 'text-purple-600 bg-purple-50' },
              { icon: <Icons.Bolt />,     label: 'Mise en service 10 min', color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Workflow visuel (3 mini-mockups) ───── */}
      <WorkflowSteps />

      {/* ───── ROI Calculator ───── */}
      <div id="calculator">
        <ROICalculator />
      </div>

      {/* ───── Features ───── */}
      <section id="features" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Ce que BankKey livre</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Tout ce qu'il faut pour répondre en premier</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200">
            {[
              { icon: <Icons.Mail />, title: 'Lecture des emails', desc: 'Connexion Gmail sécurisée. Synchronisation automatique des nouvelles demandes entrantes.' },
              { icon: <Icons.Gauge />, title: 'Score de bancabilité', desc: 'Notation 0-100 selon vos critères : revenus, apport, situation pro, maturité du projet.' },
              { icon: <Icons.FileText />, title: 'Pré-dossier structuré', desc: 'Profil emprunteur complet : champs extraits automatiquement, prêt pour votre CRM.' },
              { icon: <Icons.Send />, title: 'Réponse email rédigée', desc: 'Message personnalisé, ton professionnel, prêt à être envoyé en un clic après relecture.' },
              { icon: <Icons.Phone />, title: 'Briefing d\'appel', desc: 'Contexte, besoin du prospect, et question clé à poser en ouverture de conversation.' },
              { icon: <Icons.Bolt />, title: 'Priorisation automatique', desc: 'Vos meilleurs dossiers en haut de liste. Les leads froids n\'encombrent plus votre boîte.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-7">
                <div className="text-slate-900 mb-4">{f.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Comparison ───── */}
      <section id="comparison" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Positionnement</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            BankKey ne remplace pas votre CRM.<br />
            <span className="text-slate-500">Il vous aide à le remplir mieux.</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Si vous utilisez déjà un CRM courtage spécialisé (Aprico, Marketis…), gardez-le. BankKey s&apos;occupe de la qualification en amont, vous gardez votre outil de gestion.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 pr-4 font-medium text-slate-500"></th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">Excel + Outlook</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-700">CRM courtage spécialisé</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-900 bg-slate-900/5 rounded-t-lg">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-slate-900 flex items-center justify-center">
                      <span className="text-white text-[7px] font-bold">BK</span>
                    </span>
                    BankKey
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Lecture automatique de la boîte mail',     excel: false, crm: false, bk: true },
                { feature: 'Qualification IA des leads entrants',      excel: false, crm: false, bk: true },
                { feature: 'Score de bancabilité automatique',         excel: false, crm: 'manual', bk: true },
                { feature: 'Pré-rédaction des réponses email',         excel: false, crm: false, bk: true },
                { feature: 'Briefing d\'appel structuré',               excel: false, crm: false, bk: true },
                { feature: 'Checklist documents par profil',           excel: false, crm: 'manual', bk: true },
                { feature: 'Gestion du pipeline dossiers',             excel: 'manual', crm: true, bk: false },
                { feature: 'Envoi multi-banques',                      excel: false, crm: true, bk: false },
                { feature: 'Archivage IOBSP 5 ans',                    excel: 'manual', crm: true, bk: false },
                { feature: 'Conformité KYC intégrée',                  excel: false, crm: true,  bk: false },
              ].map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                  <td className="py-3 pr-4 text-slate-700">{row.feature}</td>
                  <Cell value={row.excel} />
                  <Cell value={row.crm} />
                  <Cell value={row.bk} accent />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 text-center mt-8">
          BankKey s&apos;intègre à votre CRM existant via export CSV (et bientôt webhooks).
        </p>
      </section>

      {/* ───── Pilot program (remplace les fake testimonials) ───── */}
      <section className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Programme pilote 2026</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-5">
            Devenez l&apos;un des premiers cabinets utilisateurs
          </h2>
          <p className="text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto">
            BankKey lance son programme pilote avec un nombre limité de cabinets sélectionnés.
            En échange de votre retour, vous bénéficiez d&apos;un tarif préférentiel à vie et d&apos;un accompagnement personnalisé.
            Les témoignages des cabinets pilotes seront publiés ici dès septembre 2026.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
            {[
              { value: '6 mois', label: 'Tarif préférentiel à vie' },
              { value: '1-1',    label: 'Accompagnement direct' },
              { value: 'CSV',    label: 'Export vers votre CRM' },
            ].map((b, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl px-3 py-4">
                <p className="text-base font-semibold text-slate-900 tracking-tight">{b.value}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{b.label}</p>
              </div>
            ))}
          </div>

          <Link href="/book" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
            Postuler au programme pilote
            <Icons.ArrowRight />
          </Link>
        </div>
      </section>

      {/* ───── Security ───── */}
      <section id="security" className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Confidentialité</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Conçu pour la confidentialité bancaire.
            </h2>
            <p className="text-slate-600 leading-relaxed mb-5">
              Les données de vos prospects sont sensibles. BankKey applique les standards de la finance européenne — chiffrement, isolation, et droit à l&apos;effacement.
            </p>
            <Link href="/security" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors">
              Voir la page sécurité complète
              <Icons.ArrowRight />
            </Link>
          </div>

          <div className="md:col-span-3 space-y-5">
            {[
              { title: 'Hébergement européen', desc: 'Infrastructure dans l\'Union européenne. Vos données ne sortent jamais de l\'UE.' },
              { title: 'Chiffrement TLS et au repos', desc: 'Toutes les communications chiffrées en transit. Stockage chiffré avec AES-256.' },
              { title: 'Isolation par cabinet', desc: 'Chaque cabinet a sa propre instance logique. Aucun croisement de données entre clients.' },
              { title: 'Droit à l\'effacement', desc: 'Suppression définitive des données sous 72h sur simple demande. Conformité RGPD complète.' },
            ].map((s) => (
              <div key={s.title} className="flex gap-4 border-l-2 border-slate-200 pl-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <PricingSection />

      {/* ───── FAQ ───── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Questions fréquentes</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Les réponses aux questions des courtiers</h2>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            {
              q: 'Quelle différence avec un assistant ou un CRM ?',
              a: 'Un CRM gère vos dossiers une fois qu\'ils sont qualifiés. BankKey intervient en amont : il filtre, qualifie et score chaque email entrant pour vous éviter de perdre du temps sur les leads froids. Les deux outils sont complémentaires.',
            },
            {
              q: 'Combien de dossiers BankKey peut-il traiter par mois ?',
              a: 'Pas de limite imposée. Nos premiers cabinets traitent de 50 à 200 emails / mois. La capacité dépend de votre boîte Gmail, pas de BankKey.',
            },
            {
              q: 'BankKey envoie-t-il des emails automatiquement ?',
              a: 'Non — et c\'est volontaire. BankKey lit vos emails en lecture seule et prépare une réponse rédigée. Vous gardez la main et envoyez après relecture. Aucun email ne part en votre nom sans validation.',
            },
            {
              q: 'L\'IA peut-elle se tromper sur un dossier ?',
              a: 'Le score est un outil de priorisation, pas une décision finale. Vous restez le décideur. Sur un panel de 500 dossiers analysés en bêta, le score correspondait à 87% à l\'appréciation du courtier humain.',
            },
            {
              q: 'Combien de temps pour mettre BankKey en place ?',
              a: 'Moins de 10 minutes. Connexion Gmail en un clic, premier prospect analysé dans les 5 minutes qui suivent. Aucune installation logicielle.',
            },
            {
              q: 'Mes données restent-elles confidentielles ?',
              a: 'Oui. Chiffrement TLS + AES-256, hébergement UE, isolation par cabinet. Vos emails ne sont jamais utilisés pour entraîner un modèle. Voir notre page sécurité pour le détail des sous-traitants.',
            },
            {
              q: 'Que se passe-t-il si je résilie ?',
              a: 'Annulation en un clic depuis votre espace. Accès maintenu jusqu\'à la fin de la période payée. Export complet de vos données + suppression définitive sous 72h sur demande.',
            },
            {
              q: 'Puis-je tester avant de m\'engager ?',
              a: 'Oui — 30 jours d\'essai gratuit sans carte bancaire, ou démo personnalisée de 20 min sur vos vrais emails.',
            },
          ].map((item, i) => (
            <details key={i} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-sm font-medium text-slate-900 pr-4">{item.q}</span>
                <span className="text-slate-400 group-open:rotate-45 transition-transform shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="text-sm text-slate-600 leading-relaxed mt-3 pr-8">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Répondez en premier, dès demain matin.
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            30 jours d'essai. Sans carte bancaire. Configuration en moins de 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-colors w-full sm:w-auto">
              Réserver une démo
              <Icons.ArrowRight />
            </Link>
            <Link href="/pro/login" className="inline-flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 font-medium px-6 py-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors w-full sm:w-auto">
              Démarrer l&apos;essai 30 jours
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                  <span className="text-slate-900 text-xs font-bold tracking-tighter">BK</span>
                </div>
                <span className="font-semibold text-white">BankKey</span>
              </div>
              <p className="text-xs leading-relaxed">
                Qualification automatique pour les cabinets de courtage en crédit immobilier.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Produit</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#calculator" className="hover:text-white transition-colors">Calculateur ROI</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Démo interactive</Link></li>
                <li><Link href="/book" className="hover:text-white transition-colors">Réserver une démo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Entreprise</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="mailto:contact@bankkey.ch" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Sécurité</Link></li>
                <li><a href="mailto:dpo@bankkey.ch" className="hover:text-white transition-colors">DPO</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Légal</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Conditions générales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2025 BankKey. Tous droits réservés.</p>
            <p className="text-slate-500">Pour les courtiers en crédit immobilier · France & Suisse</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
