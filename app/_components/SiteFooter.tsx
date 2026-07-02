import Link from 'next/link'
import { Wordmark } from './Logo'

// ════════════════════════════════════════════════════════════════════════
//  SiteFooter — footer compact commun des pages publiques secondaires
//  (book, security, privacy, terms, demo…). La landing garde son footer
//  riche ; toutes les autres pages utilisent celui-ci.
// ════════════════════════════════════════════════════════════════════════

export default function SiteFooter() {
  return (
    <footer className="bg-navy py-10">
      <div className="wrap flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wordmark size={18} tone="onDark" />
          <span className="text-xs text-slate-500">© 2026 · France & Suisse</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/book" className="hover:text-white transition-colors">Réserver une démo</Link>
          <Link href="/security" className="hover:text-white transition-colors">Sécurité</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
          <a href="mailto:contact@bankkey.ch" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
