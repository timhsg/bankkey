'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  Sidebar de l'app pro — sticky desktop, drawer mobile
// ════════════════════════════════════════════════════════════════════════

const Icons = {
  Home: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Users: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Bank: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Card: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Inbox: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

interface NavItem {
  href: string
  label: string
  icon: () => React.JSX.Element
  matchExact?: boolean
}

const PRIMARY_NAV: NavItem[] = [
  { href: '/pro',           label: 'Aujourd\'hui',   icon: Icons.Home, matchExact: true },
  { href: '/pro/prospects', label: 'Prospects',      icon: Icons.Users },
  { href: '/pro/banks',     label: 'Banques',        icon: Icons.Bank },
  { href: '/pro/bilan',         label: 'Bilan du mois',  icon: Icons.Calendar },
  { href: '/pro/statistiques',  label: 'Statistiques',   icon: Icons.Chart },
  { href: '/pro/sources',   label: 'Sources',        icon: Icons.Inbox },
]

const SECONDARY_NAV: NavItem[] = [
  { href: '/pro/settings', label: 'Profil',     icon: Icons.Settings },
  { href: '/pro/billing',  label: 'Abonnement', icon: Icons.Card },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const [email, setEmail]     = useState<string | null>(null)
  const [agency, setAgency]   = useState<string | null>(null)
  const [planStatus, setPlanStatus] = useState<{ plan: string; trialDaysLeft: number | null }>({ plan: 'trial', trialDaysLeft: null })
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('email, agency_name, broker_memory, subscription_plan, trial_ends_at')
        .single()

      if (data) {
        setEmail(data.email)
        setAgency(data.broker_memory?.agencyName ?? data.agency_name ?? null)
        const trialDays = data.trial_ends_at
          ? Math.max(0, Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : null
        setPlanStatus({ plan: data.subscription_plan ?? 'trial', trialDaysLeft: trialDays })
      }
    }
    void load()
  }, [supabase])

  // Fermer le drawer mobile à chaque navigation
  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/pro/login')
  }

  function isActive(item: NavItem) {
    if (item.matchExact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item)
    return (
      <Link
        href={item.href}
        className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          active
            ? 'bg-slate-100 text-slate-900 font-medium'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <span className={active ? 'text-slate-900' : 'text-slate-400'}>
          <item.icon />
        </span>
        {item.label}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-900 rounded-r" />
        )}
      </Link>
    )
  }

  const isPro = planStatus.plan === 'pro'

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
        aria-label="Ouvrir le menu"
      >
        <Icons.Menu />
      </button>

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-200 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Brand + close mobile */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
          <Link href="/pro" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tighter">BK</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-sm">BankKey</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700"
            aria-label="Fermer le menu"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Nav primaire */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-3">Navigation</p>
          <ul className="space-y-0.5 mb-6">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}><NavLink item={item} /></li>
            ))}
          </ul>

          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2 px-3">Cabinet</p>
          <ul className="space-y-0.5">
            {SECONDARY_NAV.map((item) => (
              <li key={item.href}><NavLink item={item} /></li>
            ))}
          </ul>
        </nav>

        {/* Statut abonnement (CTA si trial) */}
        {!isPro && (
          <div className="mx-3 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">Essai gratuit</p>
            <p className="text-xs text-slate-700 mb-2 leading-tight">
              {planStatus.trialDaysLeft !== null
                ? `${planStatus.trialDaysLeft} jours restants`
                : 'Période d\'essai en cours'}
            </p>
            <Link
              href="/pro/billing"
              className="block text-center text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded transition-colors"
            >
              Passer à Pro
            </Link>
          </div>
        )}

        {/* Footer user */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-slate-700">
                {(agency ?? email ?? '?').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{agency ?? 'Mon cabinet'}</p>
              <p className="text-[11px] text-slate-500 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors mt-1"
          >
            <Icons.Logout />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
