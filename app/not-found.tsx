import Link from 'next/link'
import SiteHeader from '@/app/_components/SiteHeader'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="stat-num select-none mb-3">404</p>
          <h1 className="text-2xl font-extrabold tracking-tightest text-[#0A0F1E] mb-3">Cette page n&apos;existe pas</h1>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-8">
            L&apos;adresse a peut-être changé, ou le lien que vous avez suivi est périmé.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="btn-primary w-full sm:w-auto justify-center text-sm">
              Retour à l&apos;accueil
            </Link>
            <Link href="/pro/login" className="btn-ghost w-full sm:w-auto justify-center text-sm">
              Espace courtier
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
