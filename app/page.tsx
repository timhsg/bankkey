import Link from 'next/link'
import { LogoMark, Wordmark } from './_components/Logo'
import ROICalculator from './_components/ROICalculator'
import { AnimateIn } from './_components/AnimateIn'

// ─────────────────────────────────────────────────────────────────────────────
// BankKey — Landing CRO v1
// Objectif : décrocher une demande de démo
// Angle : productivité courtier, zéro mention IA dans les sections principales
// ─────────────────────────────────────────────────────────────────────────────

// ── Icônes inline ───────────────────────────────────────────────────────────

function Icon({ d, className = 'w-5 h-5' }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {d.split('|').map((path, i) => <path key={i} d={path} />)}
    </svg>
  )
}

const ChevronDown = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const ArrowRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
)

const Check = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ── Données ─────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: 'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
    title: 'Des dizaines d\'emails par semaine',
    desc: 'Empruntis, SeLoger, Pretto, formulaires web. Les demandes arrivent de partout. Trier manuellement vous coûte plusieurs heures chaque semaine.',
  },
  {
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    title: 'Des prospects non qualifiés',
    desc: 'Apport insuffisant, taux d\'endettement hors normes, situation professionnelle précaire. Vous le découvrez après 30 minutes d\'analyse.',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    title: 'Le concurrent a répondu en premier',
    desc: 'En financement immobilier, le premier courtier à rappeler a 3 fois plus de chances de signer. Chaque heure compte.',
  },
  {
    icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2',
    title: 'Des informations toujours manquantes',
    desc: 'Avis d\'imposition, bulletins de salaire, relevés bancaires. Vous relancez. Ils ne répondent pas. Vous relancez encore.',
  },
  {
    icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    title: 'Des relances oubliées',
    desc: 'Sans suivi automatisé, certains prospects passent entre les mailles. Ce dossier que vous n\'avez pas relancé, votre concurrent l\'a signé.',
  },
  {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    title: 'Trois semaines de travail pour rien',
    desc: 'Vous avez instruit un dossier pendant des semaines. Résultat : le prospect n\'est pas finançable. Vous le saviez dès le premier email.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'La demande arrive',
    desc: 'Gmail, Outlook, formulaire web, Empruntis, SeLoger, Pretto. BankKey centralise toutes vos sources en un seul endroit, sans configuration.',
    detail: 'Connexion en 10 minutes, aucune migration de données.',
  },
  {
    num: '02',
    title: 'Le dossier est préparé',
    desc: 'BankKey extrait les informations clés de chaque demande, calcule la finançabilité et identifie les informations manquantes.',
    detail: 'Score de finançabilité, checklist documents, profil emprunteur.',
  },
  {
    num: '03',
    title: 'La réponse est rédigée',
    desc: 'Chaque prospect reçoit une réponse personnalisée dans votre ton. Vous relisez en 30 secondes et envoyez depuis votre propre adresse Gmail.',
    detail: 'Rien ne part sans votre validation. Vous gardez le contrôle.',
  },
  {
    num: '04',
    title: 'Vous intervenez sur les vraies opportunités',
    desc: 'Votre tableau de bord affiche uniquement les dossiers qui méritent un appel, classés par priorité. Fini l\'administratif, place aux rendez-vous.',
    detail: 'Briefing d\'appel structuré inclus pour chaque prospect qualifié.',
  },
]

const BENEFITS = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    metric: '< 5 min',
    title: 'Délai de réponse initial',
    desc: 'Chaque prospect reçoit une réponse dans les minutes qui suivent sa demande. Pas dans les 48 heures.',
  },
  {
    icon: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z',
    metric: '×2',
    title: 'Dossiers traités par semaine',
    desc: 'Sans recruter, sans travailler plus. Simplement en éliminant les tâches administratives répétitives.',
  },
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    metric: '−80%',
    title: 'Temps de qualification',
    desc: '30 minutes par prospect en moyenne. BankKey ramène ça à 2 minutes. Vous vérifiez, vous décidez.',
  },
  {
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    metric: '100%',
    title: 'Prospects répondus',
    desc: 'Aucun prospect ne reste sans réponse, aucune relance n\'est oubliée. Votre réputation professionnelle est protégée.',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0',
    metric: '0 €',
    title: 'Recrutement supplémentaire',
    desc: 'Pas besoin d\'un assistant pour trier les emails. BankKey fait ce travail avant même que vous arriviez au bureau.',
  },
  {
    icon: 'M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    metric: '+',
    title: 'Expérience client',
    desc: 'Vos prospects reçoivent une réponse rapide, personnalisée et professionnelle. Ils vous recommandent plus souvent.',
  },
]

const BEFORE_AFTER = [
  {
    before: '30 minutes pour qualifier un seul prospect',
    after: '2 minutes pour valider un dossier déjà structuré',
  },
  {
    before: 'Réponse au prospect dans les 24 à 48 heures',
    after: 'Réponse initiale envoyée en moins de 5 minutes',
  },
  {
    before: 'Relances manuelles, souvent oubliées',
    after: 'Suivi automatique — aucun prospect ne disparaît',
  },
  {
    before: 'Dossier non finançable découvert après 3 semaines',
    after: 'Score de finançabilité calculé dès la première demande',
  },
  {
    before: 'Informations manquantes découvertes en réunion',
    after: 'Checklist documents envoyée automatiquement au prospect',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Comment BankKey reçoit-il les demandes de mes prospects ?',
    a: 'BankKey se connecte à votre boîte Gmail ou Outlook en lecture seule. Il reconnaît automatiquement les demandes provenant d\'Empruntis, SeLoger, Pretto, Meilleurtaux ou de votre propre formulaire web. Vous pouvez aussi transférer manuellement un email. La mise en place prend moins de 10 minutes.',
  },
  {
    q: 'Est-ce que BankKey envoie des emails à ma place ?',
    a: 'Non. BankKey rédige le brouillon, vous relisez, vous cliquez envoyer depuis votre propre adresse Gmail. Rien ne part sans votre validation. Vous gardez le contrôle total de chaque communication.',
  },
  {
    q: 'Quelle différence avec mon CRM actuel ?',
    a: 'Votre CRM gère vos dossiers en cours et vos relances commerciales. BankKey gère la phase d\'avant : la réception des demandes, la qualification initiale et la préparation du dossier. Les deux fonctionnent ensemble. BankKey ne remplace pas votre CRM.',
  },
  {
    q: 'Combien de demandes BankKey peut-il traiter par mois ?',
    a: 'Aucun plafond. Les cabinets pilotes traitent entre 50 et 200 demandes par mois. BankKey s\'adapte à votre volume.',
  },
  {
    q: 'Est-ce conforme au RGPD ?',
    a: 'Oui. L\'infrastructure est hébergée à Francfort, dans l\'Union européenne. Les données sont chiffrées en transit et au repos. Chaque cabinet est isolé — aucun croisement de données n\'est possible. Vous pouvez demander la suppression de toutes vos données sous 72 heures.',
  },
  {
    q: 'Combien de temps pour démarrer ?',
    a: 'Dix minutes. Création de compte avec Google, connexion Gmail ou Outlook, premier dossier analysé dans la foulée. Aucune formation longue, aucune migration de données.',
  },
  {
    q: 'Utilisez-vous l\'intelligence artificielle ?',
    a: 'Certaines fonctions de BankKey sont assistées par des technologies avancées de traitement du langage afin d\'accélérer l\'analyse des demandes et la rédaction des réponses. Vous n\'avez aucune configuration technique à effectuer. Le résultat, c\'est un dossier structuré et une réponse prête — le reste ne vous concerne pas.',
  },
  {
    q: 'Puis-je annuler à tout moment ?',
    a: 'Oui. Annulation en un clic depuis votre espace. Vous gardez l\'accès jusqu\'à la fin du mois payé. Vos données vous sont exportées en CSV et supprimées de nos serveurs sous 72 heures.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0A0F1E] antialiased">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
        <div className="wrap h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Wordmark size={24} />
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#374151]">
            <a href="#probleme" className="hover:text-navy transition-colors">Le problème</a>
            <a href="#fonctionnement" className="hover:text-navy transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-navy transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-navy transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/pro/login" className="hidden sm:inline text-sm font-medium text-[#374151] hover:text-navy transition-colors px-3 py-2">
              Connexion
            </Link>
            <Link href="/book" className="btn-primary text-sm py-2.5 px-5">
              Réserver une démonstration
            </Link>
          </div>
        </div>
      </header>

      {/* ─── SECTION 1 — HERO ─── */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="hero-glow" />

        <div className="wrap relative">
          <div className="max-w-4xl mx-auto text-center">

            <div className="badge mb-7 reveal">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Conçu exclusivement pour les courtiers en crédit
            </div>

            <h1 className="text-[2.75rem] sm:text-6xl md:text-[5.5rem] font-extrabold tracking-tightest leading-[1.0] mb-7 reveal reveal-delay-1">
              Le premier courtier<br />
              à répondre{' '}
              <span className="text-gradient">décroche le dossier.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#374151] leading-relaxed mb-10 max-w-2xl mx-auto reveal reveal-delay-2">
              BankKey centralise toutes vos demandes de financement, qualifie chaque prospect et prépare votre réponse — avant même que vous arriviez au bureau. Vous intervenez uniquement sur les vraies opportunités.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 reveal reveal-delay-3">
              <Link href="/book" className="btn-primary w-full sm:w-auto justify-center px-7 py-3.5 text-base">
                Réserver une démonstration
                <ArrowRight />
              </Link>
              <a href="#fonctionnement" className="btn-ghost w-full sm:w-auto justify-center px-6 py-3.5 text-base">
                Voir comment ça fonctionne
                <ChevronDown />
              </a>
            </div>

            <p className="text-sm text-[#9CA3AF] reveal reveal-delay-4">
              Essai 30 jours gratuit · Aucune carte bancaire · Mise en route en 10 minutes
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 rounded-2xl border border-[#E5E7EB] shadow-[0_32px_80px_rgba(10,31,92,0.12)] overflow-hidden bg-[#F7F8FA] reveal reveal-delay-4">
            {/* Barre fenêtre */}
            <div className="h-10 bg-[#EAEDF0] border-b border-[#E5E7EB] flex items-center px-4 gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="ml-4 text-xs text-[#9CA3AF] font-medium">BankKey — Tableau de bord</span>
            </div>

            <div className="p-6 md:p-8">
              {/* Mini topbar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[#0A0F1E]">Lundi 7h32 — 12 demandes reçues cette nuit</h3>
                  <p className="text-sm text-[#6B7280] mt-0.5">4 dossiers qualifiés · 8 écartés (non finançables ou hors périmètre)</p>
                </div>
                <span className="badge hidden sm:inline-flex">Mise à jour automatique</span>
              </div>

              {/* Leads qualifiés */}
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {[
                  { nom: 'M. Fontaine', ville: 'Lyon 6e', projet: 'Résidence principale · 380 000 €', apport: '60 000 € · CDI · 7 ans ancienneté', score: 94, badge: 'À appeler', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', src: 'Empruntis' },
                  { nom: 'Mme Legrand', ville: 'Bordeaux', projet: 'Investissement locatif · 220 000 €', apport: '30 000 € · Fonctionnaire', score: 81, badge: 'À appeler', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', src: 'SeLoger' },
                  { nom: 'M. & Mme Moreau', ville: 'Genève', projet: 'Résidence principale · 650 000 CHF', apport: '130 000 CHF · Indépendant', score: 72, badge: 'Informations manquantes', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', src: 'Formulaire web' },
                  { nom: 'Mme Dubois', ville: 'Paris 15e', projet: 'Résidence principale · 490 000 €', apport: '45 000 € · CDI · 2 ans', score: 67, badge: 'À examiner', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', src: 'Pretto' },
                ].map((lead) => (
                  <div key={lead.nom} className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:shadow-card transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-bold text-sm text-[#0A0F1E]">{lead.nom} · {lead.ville}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{lead.projet}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-navy text-lg leading-none">{lead.score}</p>
                        <p className="text-[10px] text-[#9CA3AF]">/ 100</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mb-3">{lead.apport}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${lead.badgeColor}`}>{lead.badge}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{lead.src}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-[#9CA3AF]">
                + 8 demandes écartées automatiquement (apport insuffisant, taux d&apos;endettement hors normes) · récupérables en un clic
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos sources ─── */}
      <div className="border-y border-[#E5E7EB] bg-[#F7F8FA] py-5">
        <div className="wrap">
          <p className="text-center text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-4">Sources de prospects gérées par BankKey</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {['Empruntis', 'SeLoger', 'Pretto', 'Meilleurtaux', 'Formulaire web', 'Transfert email'].map((src) => (
              <span key={src} className="text-sm font-semibold text-[#9CA3AF]">{src}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── SECTION 2 — LE PROBLÈME ─── */}
      <section id="probleme" className="py-20 md:py-28">
        <div className="wrap">
          <AnimateIn className="text-center mb-14">
            <p className="label mb-3">Le quotidien actuel</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
              Vous reconnaissez<br />
              <span className="text-gradient">cette situation ?</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Chaque matin, les mêmes tâches chronophages. Chaque semaine, des prospects perdus faute de réactivité.
            </p>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p, i) => (
              <AnimateIn key={p.title} delay={i * 60} className="card border-red-50 bg-white hover:border-red-100">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-400 mb-4">
                  <Icon d={p.icon} />
                </div>
                <h3 className="font-bold text-[15px] mb-2 text-[#0A0F1E]">{p.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{p.desc}</p>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn delay={200} className="mt-12 text-center">
            <div className="inline-block bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-8 py-5">
              <p className="text-lg font-bold text-[#0A0F1E]">
                En moyenne, un courtier passe{' '}
                <span className="text-gradient">3 à 4 heures par semaine</span>
                {' '}sur des tâches qui ne génèrent aucune commission.
              </p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── SECTION 3 — COMMENT ÇA FONCTIONNE ─── */}
      <section id="fonctionnement" className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-20 md:py-28">
        <div className="wrap">
          <AnimateIn className="text-center mb-16">
            <p className="label mb-3">Comment ça fonctionne</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
              Simple. Efficace. <span className="text-gradient">Immédiat.</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              BankKey fonctionne en arrière-plan. Vous ouvrez votre tableau de bord, vos dossiers sont prêts.
            </p>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {STEPS.map((s, i) => (
              <AnimateIn key={s.num} delay={i * 80} className="bg-white rounded-2xl border border-[#E5E7EB] p-7 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                    {s.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                    <p className="text-[#374151] leading-relaxed mb-3">{s.desc}</p>
                    <p className="text-sm text-accent font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      {s.detail}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn delay={200} className="mt-12">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-7 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-[#0A0F1E] text-lg mb-1">Le lundi matin, pendant que vous prenez votre café</p>
                <p className="text-[#6B7280]">BankKey a déjà analysé les 12 demandes reçues depuis vendredi soir. 4 dossiers qualifiés vous attendent. Vous commencez votre semaine en appelant des prospects finançables — pas en triant vos emails.</p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─── SECTION 4 — BÉNÉFICES ─── */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <AnimateIn className="text-center mb-14">
            <p className="label mb-3">Ce que vous gagnez</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
              Moins d&apos;administratif.<br />
              <span className="text-gradient">Plus de dossiers signés.</span>
            </h2>
          </AnimateIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <AnimateIn key={b.title} delay={i * 60} className="card">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center text-white shrink-0">
                    <Icon d={b.icon} />
                  </div>
                  <p className="stat-num">{b.metric}</p>
                </div>
                <h3 className="font-bold text-[15px] mb-2">{b.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{b.desc}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Calculateur ROI ─── */}
      <ROICalculator />

      {/* ─── SECTION 5 — AVANT / APRÈS ─── */}
      <section className="bg-[#F7F8FA] border-y border-[#E5E7EB] py-20 md:py-28">
        <div className="wrap">
          <AnimateIn className="text-center mb-14">
            <p className="label mb-3">La différence en pratique</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
              Votre semaine<br />
              <span className="text-gradient">avant et après BankKey.</span>
            </h2>
          </AnimateIn>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Avant */}
            <AnimateIn direction="left" className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
              <div className="bg-[#FEF2F2] border-b border-red-100 px-6 py-4">
                <p className="font-bold text-red-700 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
                  Avant BankKey
                </p>
              </div>
              <ul className="divide-y divide-[#F3F4F6]">
                {BEFORE_AFTER.map((row) => (
                  <li key={row.before} className="px-6 py-4 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </span>
                    <span className="text-sm text-[#374151]">{row.before}</span>
                  </li>
                ))}
              </ul>
            </AnimateIn>

            {/* Après */}
            <AnimateIn direction="right" delay={80} className="bg-white rounded-2xl border-2 border-accent overflow-hidden shadow-[0_8px_40px_rgba(59,95,224,0.1)]">
              <div className="bg-gradient-to-r from-navy to-accent px-6 py-4">
                <p className="font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
                  Avec BankKey
                </p>
              </div>
              <ul className="divide-y divide-[#F3F4F6]">
                {BEFORE_AFTER.map((row) => (
                  <li key={row.after} className="px-6 py-4 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span className="text-sm font-medium text-[#0A0F1E]">{row.after}</span>
                  </li>
                ))}
              </ul>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─── */}
      <section id="tarifs" className="py-20 md:py-28">
        <div className="wrap">
          <AnimateIn className="text-center mb-14">
            <p className="label mb-3">Tarif</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tightest mb-4">
              Un dossier signé<br />
              <span className="text-gradient">rembourse 12 mois.</span>
            </h2>
            <p className="text-[#6B7280] text-lg max-w-lg mx-auto">
              La commission moyenne sur un dossier immobilier est de 2 500 €. BankKey coûte 199 € par mois.
            </p>
          </AnimateIn>

          <AnimateIn className="max-w-md mx-auto">
            <div className="rounded-2xl border-2 border-accent p-8 shadow-[0_8px_40px_rgba(59,95,224,0.12)] bg-white">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-navy tracking-tightest">199</span>
                <span className="text-2xl font-bold text-[#9CA3AF]">€</span>
                <span className="text-[#6B7280] font-medium">/ mois</span>
              </div>
              <p className="text-sm text-[#9CA3AF] mb-6">199 CHF / mois pour la Suisse</p>

              <ul className="space-y-3 mb-8">
                {[
                  'Demandes illimitées, toutes sources',
                  'Qualification et score de finançabilité',
                  'Réponse initiale rédigée pour chaque prospect',
                  'Briefing d\'appel structuré',
                  'Checklist documents FR / CH',
                  'Relances automatiques',
                  'Tableau de bord prospects',
                  'Export CSV inclus',
                  'Support direct avec le fondateur',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#374151]">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/book" className="btn-primary w-full justify-center py-3.5">
                Réserver une démonstration
                <ArrowRight />
              </Link>
              <p className="text-center text-xs text-[#9CA3AF] mt-3">
                30 jours d&apos;essai gratuit · Sans carte bancaire · Annulable à tout moment
              </p>
            </div>
          </AnimateIn>

          <AnimateIn delay={100} className="mt-8 text-center">
            <p className="text-sm text-[#9CA3AF]">
              Programme fondateur — 50 cabinets pilotes · Tarif bloqué à vie · France & Suisse
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ─── SECTION 6 — FAQ ─── */}
      <section id="faq" className="bg-[#F7F8FA] border-t border-[#E5E7EB] py-20 md:py-28">
        <div className="wrap max-w-2xl mx-auto">
          <AnimateIn className="text-center mb-14">
            <p className="label mb-3">Questions fréquentes</p>
            <h2 className="text-4xl font-extrabold tracking-tightest">Tout ce que vous devez savoir.</h2>
          </AnimateIn>

          <div className="divide-y divide-[#E5E7EB] bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-5 gap-4 hover:bg-[#F7F8FA] transition-colors">
                  <span className="font-semibold text-[#0A0F1E] text-[15px]">{item.q}</span>
                  <svg className="w-5 h-5 text-[#9CA3AF] shrink-0 group-open:rotate-45 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-[#374151] leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7 — CTA FINAL ─── */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 80% 50%, rgba(59,95,224,0.35), transparent)' }} />

        <div className="relative wrap text-center">
          <AnimateIn direction="none">
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-6">Pour les courtiers qui veulent aller plus loin</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tightest mb-5 leading-[1.05]">
              Concentrez-vous sur<br />les rendez-vous.
            </h2>
            <p className="text-xl text-blue-200 mb-10 max-w-lg mx-auto font-medium">
              BankKey s&apos;occupe du reste.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/book" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-navy font-bold px-8 py-4 rounded-lg transition-colors text-base shadow-[0_4px_24px_rgba(0,0,0,0.15)] w-full sm:w-auto">
                Réserver une démonstration
                <ArrowRight />
              </Link>
              <Link href="/demo/access" className="inline-flex items-center justify-center gap-2 text-white hover:text-blue-200 font-medium px-6 py-4 rounded-lg border border-white/25 hover:border-white/40 transition-colors w-full sm:w-auto">
                Voir le compte démo
              </Link>
            </div>

            <p className="text-sm text-blue-300">
              Essai 30 jours gratuit · Sans carte bancaire · Mise en route en 10 minutes
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-navy">
        <div className="wrap py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wordmark size={22} tone="onDark" />
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Le logiciel de qualification des demandes de financement pour les courtiers en crédit immobilier — France & Suisse.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <a href="#fonctionnement" className="hover:text-white transition-colors">Comment ça marche</a>
              <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
              <a href="mailto:contact@bankkey.ch" className="hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© 2026 BankKey. Tous droits réservés.</p>
            <p>Courtage en crédit immobilier · France & Suisse</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
