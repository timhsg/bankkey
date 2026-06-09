// ════════════════════════════════════════════════════════════════════════
//  Logo BankKey — icône clé géométrique navy
//  Utilisé partout : landing, header, sidebar, login, admin, footer
// ════════════════════════════════════════════════════════════════════════

interface LogoMarkProps {
  /** Taille en pixels (carré). Défaut 28. */
  size?: number
  /** Variant "light" = fond navy + clé blanche (par défaut). "dark" = fond blanc + clé navy. */
  variant?: 'light' | 'dark'
  /** Classes Tailwind additionnelles sur le wrapper */
  className?: string
}

export function LogoMark({ size = 28, variant = 'light', className = '' }: LogoMarkProps) {
  const bg = variant === 'light' ? '#1e3a8a' : '#ffffff'
  const fg = variant === 'light' ? '#ffffff' : '#1e3a8a'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-label="BankKey"
      role="img"
    >
      <rect width="32" height="32" rx={Math.round(size * 0.22)} fill={bg} />
      <circle cx="13" cy="14" r="5" fill="none" stroke={fg} strokeWidth="2.5" />
      <circle cx="13" cy="14" r="1.8" fill={fg} />
      <rect x="17.5" y="12.75" width="8.5" height="2.5" rx="1.25" fill={fg} />
      <rect x="21.5" y="15.25" width="2" height="2.5" rx="1" fill={fg} />
      <rect x="24.5" y="15.25" width="2" height="2" rx="1" fill={fg} />
    </svg>
  )
}

interface LogoProps {
  /** Affiche le nom "BankKey" à côté de la marque */
  showName?: boolean
  /** Taille du carré */
  size?: number
  /** Style du nom */
  nameClassName?: string
  /** Variante du fond */
  variant?: 'light' | 'dark'
  /** Classes wrapper */
  className?: string
}

/**
 * Logo complet : icône + nom.
 * Par défaut le nom est affiché en Inter semibold slate-900.
 */
export default function Logo({
  showName = true,
  size = 28,
  nameClassName = 'font-semibold text-slate-900 tracking-tight',
  variant = 'light',
  className = 'flex items-center gap-2',
}: LogoProps) {
  return (
    <span className={className}>
      <LogoMark size={size} variant={variant} />
      {showName && <span className={nameClassName}>BankKey</span>}
    </span>
  )
}
