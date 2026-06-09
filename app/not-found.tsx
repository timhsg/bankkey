import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">Page non trouvée</h2>
        <p className="text-slate-400 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été supprimée.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/pro/login"
            className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Espace courtier
          </Link>
        </div>
      </div>
    </div>
  )
}
