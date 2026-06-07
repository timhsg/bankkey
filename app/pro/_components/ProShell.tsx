'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

/**
 * Shell de l'app pro : sidebar + content area.
 * /pro/login et /pro/onboarding utilisent un layout fullscreen sans sidebar.
 */
export default function ProShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullscreen = pathname === '/pro/login' || pathname === '/pro/onboarding'

  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-60">
        {children}
      </div>
    </div>
  )
}
