// ════════════════════════════════════════════════════════════════════════
//  Logo BankKey
//  - LogoMark : l'icône (clé géométrique) — favicon, sidebar, headers
//  - Wordmark : icône + "BankKey" stylisé (Bank en encre, Key en dégradé)
//  Couleurs de marque : navy #0A1F5C → accent #3b5fe0
// ════════════════════════════════════════════════════════════════════════

interface LogoMarkProps {
  /** Taille en pixels (carré). Défaut 28. */
  size?: number
  /** "light" = carré dégradé + clé blanche (défaut). "dark" = clé blanche sur fond translucide (sur navy). "mono" = clé navy sans fond. */
  variant?: 'light' | 'dark' | 'mono'
  /** Classes Tailwind additionnelles */
  className?: string
}

/**
 * Icône BankKey — clé géométrique.
 * Anneau (panneton) + tige + 2 dents, dans un carré arrondi au dégradé de marque.
 */
export function LogoMark({ size = 28, variant = 'light', className = '' }: LogoMarkProps) {
  const id = `bk-grad-${variant}`
  const radius = Math.round(32 * 0.24)

  // Couleur de la clé selon le variant
  const key = variant === 'mono' ? '#0A1F5C' : '#FFFFFF'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-label="BankKey"
      role="img"
      fill="none"
    >
      {variant !== 'mono' && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A1F5C" />
            <stop offset="1" stopColor="#3b5fe0" />
          </linearGradient>
        </defs>
      )}

      {/* Fond carré arrondi */}
      {variant === 'light' && (
        <rect width="32" height="32" rx={radius} fill={`url(#${id})`} />
      )}
      {variant === 'dark' && (
        <rect width="32" height="32" rx={radius} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.20)" />
      )}

      {/* Clé : anneau + tige + dents */}
      <g stroke={key} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12.5" cy="13" r="4.3" fill="none" />
        <path d="M15.4 16.1 L23 23" />
        <path d="M20.4 20 L22.6 17.8" />
        <path d="M23 22.6 L25 20.6" />
      </g>
      {/* Point central de l'anneau */}
      <circle cx="12.5" cy="13" r="1.5" fill={key} />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════════════════
//  Wordmark — le logo texte "BankKey"
//  "Bank" en encre navy, "Key" en dégradé de marque. Inter extrabold serré.
// ════════════════════════════════════════════════════════════════════════

interface WordmarkProps {
  /** Taille de l'icône en px (le texte suit proportionnellement). Défaut 26. */
  size?: number
  /** Affiche l'icône à gauche du texte. Défaut true. */
  showIcon?: boolean
  /** "default" = texte navy/dégradé sur fond clair. "onDark" = texte blanc sur fond navy. */
  tone?: 'default' | 'onDark'
  /** Variant de l'icône (par défaut déduit du tone) */
  iconVariant?: 'light' | 'dark' | 'mono'
  /** Classes wrapper */
  className?: string
}

export function Wordmark({
  size = 26,
  showIcon = true,
  tone = 'default',
  iconVariant,
  className = '',
}: WordmarkProps) {
  const resolvedIconVariant = iconVariant ?? (tone === 'onDark' ? 'dark' : 'light')
  // Taille de police calée sur l'icône
  const fontSize = Math.round(size * 0.72)

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="BankKey">
      {showIcon && <LogoMark size={size} variant={resolvedIconVariant} />}
      <span
        className="font-extrabold tracking-tightest leading-none select-none"
        style={{ fontSize }}
      >
        <span className={tone === 'onDark' ? 'text-white' : 'text-navy'}>Bank</span>
        <span className={tone === 'onDark' ? 'text-blue-300' : 'text-gradient'}>Key</span>
      </span>
    </span>
  )
}

// ── Compat : Logo complet (icône + nom) — conservé pour l'existant ──

interface LogoProps {
  showName?: boolean
  size?: number
  nameClassName?: string
  variant?: 'light' | 'dark' | 'mono'
  className?: string
}

export default function Logo({
  showName = true,
  size = 26,
  variant = 'light',
  className = 'flex items-center gap-2',
}: LogoProps) {
  const tone = variant === 'dark' ? 'onDark' : 'default'
  if (!showName) {
    return (
      <span className={className}>
        <LogoMark size={size} variant={variant} />
      </span>
    )
  }
  return <Wordmark size={size} tone={tone} iconVariant={variant} className={className} />
}
