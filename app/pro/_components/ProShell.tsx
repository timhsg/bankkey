'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

/**
 * Shell de l'app pro : sidebar fixe à gauche, content area à droite.
 * /pro/login et /pro/onboarding utilisent un layout fullscreen sans sidebar.
 */
export default function ProShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFullscreen = pathname === '/pro/login' || pathname === '/pro/onboarding'

  if (isFullscreen) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  )
}
