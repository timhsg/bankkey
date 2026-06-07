import type { Metadata } from 'next'
import ProShell from './_components/ProShell'

export const metadata: Metadata = {
  title: 'BankKey',
  description: 'Tableau de bord de qualification automatique',
}

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return <ProShell>{children}</ProShell>
}
