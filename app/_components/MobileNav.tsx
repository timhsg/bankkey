'use client'

import { useState } from 'react'
import Link from 'next/link'

// Menu mobile de la landing (burger) — n'apparaît qu'en dessous de md.
export default function MobileNav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '#probleme',       label: 'Le problème' },
    { href: '#fonctionnement', label: 'Comment ça marche' },
    { href: '#tarifs',         label: 'Tarifs' },
    { href: '#faq',            label: 'FAQ' },
  ]

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={open}
        className="p-2 -mr-2 text-[#374151] hover:text-navy transition-colors"
      >
        {open ? (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16" /><path d="M4 6h16" /><path d="M4 18h16" /></svg>
        )}
      </button>

      {open && (
        <>
          {/* Voile pour fermer au tap en dehors */}
          <div className="fixed inset-0 top-16 bg-black/20 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-16 bg-white border-b border-[#E5E7EB] shadow-lg z-40">
            <nav className="wrap py-4 flex flex-col">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2.5 text-sm font-medium text-[#374151] hover:text-navy transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <div className="border-t border-[#E5E7EB] mt-2 pt-3 flex flex-col gap-2">
                <Link href="/pro/login" onClick={() => setOpen(false)} className="px-2 py-2 text-sm font-medium text-[#374151] hover:text-navy transition-colors">
                  Connexion
                </Link>
                <Link href="/book" onClick={() => setOpen(false)} className="btn-primary text-sm py-2.5 justify-center">
                  Réserver une démonstration
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
