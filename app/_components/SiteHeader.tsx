import Link from 'next/link'
import { Wordmark } from './Logo'

// ════════════════════════════════════════════════════════════════════════
//  SiteHeader — header commun des pages publiques.
//  Chrome UNIQUE pour tout le site : lockup Wordmark à gauche,
//  zone libre à droite (nav, lien retour, CTA…).
//  Ne jamais recoder un header public à la main : importer ce composant.
// ════════════════════════════════════════════════════════════════════════

export default function SiteHeader({
  right,
  homeHref = '/',
}: {
  /** Contenu de la zone droite (nav, lien retour, CTA…) */
  right?: React.ReactNode
  /** Cible du clic sur le logo (défaut : accueil) */
  homeHref?: string
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="wrap h-16 flex items-center justify-between">
        <Link href={homeHref} className="flex items-center" aria-label="BankKey, retour à l'accueil">
          <Wordmark size={24} />
        </Link>
        {right}
      </div>
    </header>
  )
}
