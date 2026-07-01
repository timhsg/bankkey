'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogoMark } from '@/app/_components/Logo'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// ════════════════════════════════════════════════════════════════════════
//  Sidebar — style bancaire pro (Qonto / Mercury)
//  Dense, sections groupées, cabinet badge en haut, statut essai en bas
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
  Webhook: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 16.98 4.43-2.5a2 2 0 0 0-2-3.46L17 13a8 8 0 0 0-15 1"/>
      <path d="m10 17.49 3.5-2.02a2 2 0 0 1 2.74.74l5.6 9.7"/>
      <path d="m18 16.98-7.21 4.16a2 2 0 1 1-2-3.46l1.94-1.12"/>
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Chevron: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
}

interface NavItem {
  href: string
  label: string
  icon: () => React.JSX.Element
  matchExact?: boolean
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Activité',
    items: [
      { href: '/pro',           label: 'Aujourd\'hui', icon: Icons.Home, matchExact: true },
      { href: '/pro/prospects', label: 'Prospects',    icon: Icons.Users },
      { href: '/pro/filtered',  label: 'Écartés',      icon: Icons.Filter },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      { href: '/pro/banks',        label: 'Banques',      icon: Icons.Bank },
      { href: '/pro/bilan',        label: 'Bilan du mois',icon: Icons.Calendar },
      { href: '/pro/statistiques', label: 'Statistiques', icon: Icons.Chart },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { href: '/pro/sources',      label: 'Sources',     icon: Icons.Inbox },
      { href: '/pro/settings',     label: 'Profil',      icon: Icons.Settings },
      { href: '/pro/billing',      label: 'Abonnement',  icon: Icons.Card },
    ],
  },
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
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
          active
            ? 'bg-navy text-white font-semibold shadow-[0_1px_2px_rgba(10,31,92,0.12)]'
            : 'text-[#374151] hover:bg-white hover:text-navy font-medium'
        }`}
      >
        <span className={`shrink-0 ${active ? 'text-white' : 'text-[#9CA3AF] group-hover:text-navy'}`}>
          <item.icon />
        </span>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            active ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const isPro = planStatus.plan === 'pro'
  const cabinetInitials = (agency ?? email ?? '?').slice(0, 2).toUpperCase()

  return (
    <>
      {/* ── Mobile toggle ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 bg-white border border-[#E5E7EB] rounded-lg p-2 shadow-sm hover:border-navy transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Icons.Menu />
      </button>

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-navy/40 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F7F8FA] border-r border-[#E5E7EB] flex flex-col
        transition-transform duration-200 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* ── Cabinet badge en haut ── */}
        <div data-tour="cabinet-badge" className="flex items-center justify-between p-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-[0_1px_3px_rgba(10,31,92,0.16)]">
              <span className="text-[12px] font-extrabold text-white tracking-tight">{cabinetInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-navy truncate leading-tight">{agency ?? 'Mon cabinet'}</p>
              <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wider">
                {isPro ? 'Plan Pro' : 'Essai gratuit'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-[#9CA3AF] hover:text-navy"
            aria-label="Fermer le menu"
          >
            <Icons.Close />
          </button>
        </div>

        {/* ── Navigation groupée ── */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2 px-3">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}><NavLink item={item} /></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Essai gratuit CTA (si trial) ── */}
        {!isPro && (
          <div className="mx-3 mb-3 p-4 bg-white border border-[#E5E7EB] rounded-xl shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Essai actif
              </p>
            </div>
            <p className="text-[13px] font-bold text-navy mb-1">
              {planStatus.trialDaysLeft !== null
                ? `${planStatus.trialDaysLeft} jour${planStatus.trialDaysLeft > 1 ? 's' : ''} restants`
                : 'Essai en cours'}
            </p>
            <p className="text-[11px] text-[#6B7280] mb-3 leading-tight">
              Conservez vos prospects qualifiés à vie.
            </p>
            <Link
              href="/pro/billing"
              className="block text-center text-[12px] font-semibold bg-brand-gradient text-white py-2 rounded-lg hover:opacity-90 transition-opacity shadow-btn"
            >
              Passer au plan Pro
            </Link>
          </div>
        )}

        {/* ── Footer user ── */}
        <div className="px-2.5 pb-3 pt-2 border-t border-[#E5E7EB] bg-white/50">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md">
            <div className="w-7 h-7 rounded-full bg-[#E5E7EB] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#374151]">
                {(email ?? '?').slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#6B7280] truncate font-medium">{email}</p>
            </div>
          </div>
          <Link
            href="/pro?tour=1"
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-navy transition-colors mt-0.5 font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Visite guidée
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-navy transition-colors mt-0.5 font-medium"
          >
            <Icons.Logout />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
