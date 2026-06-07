// ════════════════════════════════════════════════════════════════════════
//  Section "Pour qui" — chaleur, emotion, scénarios concrets
// ════════════════════════════════════════════════════════════════════════

const PROFILES = [
  {
    role: 'Courtier indépendant',
    color: 'from-amber-100 to-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    avatar: 'bg-amber-200 text-amber-700',
    initials: 'MD',
    name: 'Marc D.',
    location: 'Lyon',
    scenario: 'Vous croulez sous 60 leads par mois et perdez les meilleurs faute de temps.',
    benefit: 'BankKey trie pour vous chaque matin. Vous attaquez vos 3 dossiers prioritaires en 30 min.',
    metric: '+2 dossiers/mois récupérés',
  },
  {
    role: 'Petit cabinet (2-5 courtiers)',
    color: 'from-emerald-100 to-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    avatar: 'bg-emerald-200 text-emerald-700',
    initials: 'SL',
    name: 'Sophie L. — Cabinet 3 personnes',
    location: 'Genève',
    scenario: 'Vos courtiers se marchent dessus sur les leads, certains sont oubliés, d\'autres relancés 3 fois.',
    benefit: 'Un tableau de bord partagé avec scoring uniforme. Chacun voit son flux, le cabinet voit le tout.',
    metric: 'Zéro lead oublié, zéro doublon',
  },
  {
    role: 'Cabinet établi (5-20 courtiers)',
    color: 'from-blue-100 to-blue-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    avatar: 'bg-blue-200 text-blue-700',
    initials: 'CB',
    name: 'Cabinet Bertrand',
    location: 'Paris',
    scenario: 'Vous avez un CRM mais la qualification reste manuelle. Vos courtiers passent 2h/jour à trier.',
    benefit: 'BankKey alimente votre CRM avec des leads pré-qualifiés. Vos courtiers se concentrent sur le relationnel.',
    metric: '8 h/sem économisées par courtier',
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
              {/* Avatar + nom */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-full ${p.avatar} flex items-center justify-center font-semibold text-sm shrink-0`}>
                  {p.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{p.role}</p>
                  <p className="text-sm text-slate-700 truncate">{p.name} · {p.location}</p>
                </div>
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
          Estimations basées sur nos courtiers pilotes. Vos résultats peuvent varier selon votre volume et votre process actuel.
        </p>
      </div>
    </section>
  )
}
