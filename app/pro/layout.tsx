import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BankKey',
  description: 'Tableau de bord de qualification automatique',
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
