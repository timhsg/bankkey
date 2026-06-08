// ════════════════════════════════════════════════════════════════════════
//  Section "Pour qui" — scénarios honnêtes, sans faux témoignages
// ════════════════════════════════════════════════════════════════════════

const PROFILES = [
  {
    role: 'Courtier indépendant',
    color: 'from-amber-100 to-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    scenario: 'Vous croulez sous les leads et perdez les meilleurs faute de temps de traitement.',
    benefit: 'BankKey trie pour vous chaque matin. Vous attaquez vos prospects prioritaires en 30 minutes au lieu de 2 heures.',
    metric: 'Jusqu\'à 2 h économisées / jour',
  },
  {
    role: 'Cabinet 2-5 courtiers',
    color: 'from-emerald-100 to-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    scenario: 'Vos courtiers se marchent dessus sur les leads. Certains prospects sont oubliés, d\'autres relancés trois fois.',
    benefit: 'Un tableau de bord partagé avec scoring uniforme. Chacun voit son flux, le cabinet voit le tout.',
    metric: 'Zéro lead oublié, zéro doublon',
  },
  {
    role: 'Cabinet établi 5-20 courtiers',
    color: 'from-blue-100 to-blue-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
    scenario: 'Vous avez un CRM mais la qualification reste manuelle. Vos courtiers passent leur matinée à trier.',
    benefit: 'BankKey alimente votre CRM avec des prospects pré-qualifiés. Vos courtiers se concentrent sur le relationnel.',
    metric: 'Plusieurs heures gagnées / semaine',
  },
]

export default function ForWhoSection() {
  return (
    <section className="bg-slate-50 border-y border-slate-100 py-24">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Pour qui</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-3">
            Conçu pour les courtiers qui veulent grandir
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Du courtier solo au cabinet structuré — BankKey s&apos;adapte à votre échelle.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {PROFILES.map((p, i) => (
            <div
              key={i}
              className={`relative bg-gradient-to-br ${p.color} border ${p.border} rounded-2xl p-6 hover-lift transition-base`}
            >
              {/* Icône + rôle */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-white/70 border ${p.border} flex items-center justify-center ${p.accent} shrink-0`}>
                  {p.icon}
                </div>
                <p className="text-sm font-semibold text-slate-900">{p.role}</p>
              </div>

              {/* Scénario */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-3 border border-white/80">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Votre quotidien</p>
                <p className="text-sm text-slate-700 leading-relaxed">{p.scenario}</p>
              </div>

              {/* Bénéfice */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/80">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Avec BankKey</p>
                <p className="text-sm text-slate-700 leading-relaxed">{p.benefit}</p>
              </div>

              {/* Métrique */}
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${p.accent}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
                <span className={`text-xs font-semibold ${p.accent}`}>{p.metric}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-12 max-w-md mx-auto">
          Bénéfices types observés selon le profil de cabinet. Les résultats réels dépendent de votre volume et de votre organisation actuelle.
        </p>
      </div>
    </section>
  )
}
