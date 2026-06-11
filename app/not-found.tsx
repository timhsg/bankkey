import Link from 'next/link'
import { LogoMark } from '@/app/_components/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-semibold text-slate-900 tracking-tight">BankKey</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="font-display text-[5rem] font-semibold leading-none text-slate-200 select-none mb-2">404</p>
          <h1 className="text-2xl font-semibold text-slate-900 mb-3">Cette page n&apos;existe pas</h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            L&apos;adresse a peut-être changé, ou le lien que vous avez suivi est périmé.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/pro/login"
              className="w-full sm:w-auto border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Espace courtier
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
