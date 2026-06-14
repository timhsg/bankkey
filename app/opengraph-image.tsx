import { ImageResponse } from 'next/og'

// ════════════════════════════════════════════════════════════════════════
//  Image Open Graph dynamique (1200x630)
//  Affichée en preview quand le lien bankkey.ch est partagé sur
//  LinkedIn, WhatsApp, email, Slack, etc. Générée à la volée par Next.
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'edge'
export const alt = 'BankKey — Le premier courtier à répondre décroche le dossier'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #0A1F5C 0%, #1a3a8f 55%, #3b5fe0 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header : marque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 32 32" fill="none">
              <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12.5" cy="13" r="4.3" fill="none" />
                <path d="M15.4 16.1 L23 23" />
                <path d="M20.4 20 L22.6 17.8" />
                <path d="M23 22.6 L25 20.6" />
              </g>
              <circle cx="12.5" cy="13" r="1.5" fill="#fff" />
            </svg>
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            BankKey
          </div>
        </div>

        {/* Titre principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: 980,
            }}
          >
            Le premier courtier à répondre décroche le dossier.
          </div>
          <div style={{ fontSize: 30, color: '#C7D2FE', maxWidth: 900, lineHeight: 1.3 }}>
            BankKey centralise, qualifie et prépare vos demandes de financement — avant votre café.
          </div>
        </div>

        {/* Footer avec CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#fff',
              color: '#0A1F5C',
              fontSize: 26,
              fontWeight: 800,
              padding: '18px 34px',
              borderRadius: 12,
            }}
          >
            Réservez une démonstration →
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ fontSize: 24, color: '#fff', fontWeight: 700 }}>bankkey.ch</div>
            <div style={{ fontSize: 20, color: '#93A4D8' }}>Courtiers en crédit · France & Suisse</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
