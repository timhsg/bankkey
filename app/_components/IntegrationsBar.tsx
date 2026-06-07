// ════════════════════════════════════════════════════════════════════════
//  Bar logos — plateformes auxquelles BankKey se connecte
//  SVG inline pour chargement instantané, design uniforme
// ════════════════════════════════════════════════════════════════════════

const LOGOS = [
  {
    name: 'Gmail',
    svg: (
      <svg className="w-7 h-7" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    name: 'Outlook',
    svg: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#0078D4">
        <path d="M11.55 21h-9V3h9v18zM10.5 4.5H4v15h6.5V4.5zM7.25 14c1.24 0 1.75-1.43 1.75-3s-.51-3-1.75-3-1.75 1.43-1.75 3 .51 3 1.75 3z" />
        <path d="M12.55 4v16l9-2V6l-9-2zm6.7 13.16l-5.4 1.04V6.05l5.4 1.05v10.06z" />
      </svg>
    ),
  },
  {
    name: 'Empruntis',
    svg: (
      <span className="text-sm font-bold tracking-tight" style={{ color: '#E63946' }}>EMPRUNTIS</span>
    ),
  },
  {
    name: 'Meilleurtaux',
    svg: (
      <span className="text-sm font-bold tracking-tight" style={{ color: '#FF6B00' }}>meilleurtaux</span>
    ),
  },
  {
    name: 'Pretto',
    svg: (
      <span className="text-sm font-bold tracking-tight" style={{ color: '#7C3AED' }}>Pretto</span>
    ),
  },
  {
    name: 'SeLoger',
    svg: (
      <span className="text-sm font-bold tracking-tight" style={{ color: '#E20020' }}>SeLoger</span>
    ),
  },
  {
    name: 'Stripe',
    svg: (
      <svg className="w-7 h-7" viewBox="0 0 32 32" fill="#635BFF">
        <path d="M13.479 9.883c-.014-2.115 2.072-2.954 4.474-2.954 1.713 0 3.726.598 4.804 1.247V14.5c-.97-.531-3.103-1.527-4.804-1.527-1.082 0-1.751.281-1.751.961 0 .744.84 1.052 1.871 1.401 2.526.855 5.806 2.043 5.806 5.516 0 3.643-2.881 5.658-7.075 5.658-1.984 0-4.131-.388-6.224-1.289v-5.494c1.923.961 4.353 1.674 6.224 1.674.835 0 1.46-.286 1.46-1.082 0-.815-.97-1.169-2.063-1.555-2.483-.883-5.722-2.022-5.722-5.288z"/>
      </svg>
    ),
  },
]

export default function IntegrationsBar() {
  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8">
          Compatible avec toutes vos sources de leads
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={logo.name}
            >
              {logo.svg}
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-8">
          Et bien d&apos;autres via votre adresse email forwarding personnalisée
        </p>
      </div>
    </section>
  )
}
