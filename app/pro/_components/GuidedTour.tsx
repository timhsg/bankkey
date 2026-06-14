'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════════
//  GuidedTour — Visite guidée en mode "spotlight"
//
//  Mécanisme :
//  - Backdrop sombre fullscreen
//  - Trou (spotlight) autour de l'élément ciblé via data-tour="<key>"
//  - Tooltip flottant ancré contre le spotlight (auto-positioned)
//  - Navigation automatique entre pages (router.push)
//  - Transitions smooth (opacity + transform)
//  - Réactivable via ?tour=1 sur n'importe quelle page /pro
// ═══════════════════════════════════════════════════════════════════════

interface Step {
  /** Page sur laquelle l'étape doit s'afficher */
  route: string
  /** Sélecteur de l'élément à spotlight (vide = modal centré) */
  target?: string
  /** Position du tooltip relative au spotlight */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** Titre de l'étape */
  title: string
  /** Description / explication */
  desc: string
  /** Liste de points-clés à montrer (facultatif) */
  bullets?: string[]
}

const STEPS: Step[] = [
  {
    route: '/pro',
    placement: 'center',
    title: 'Bienvenue dans votre cabinet BankKey',
    desc: 'En 90 secondes, on vous montre les 5 endroits qui vont vous faire gagner du temps dès demain matin.',
    bullets: [
      'Aucune installation',
      'Vos données restent à Francfort',
      'Réactivable à tout moment depuis la sidebar',
    ],
  },
  {
    route: '/pro',
    target: '[data-tour="cabinet-badge"]',
    placement: 'right',
    title: 'Votre cabinet',
    desc: 'Toutes vos données, scopées à votre seul cabinet. Aucun croisement avec un autre courtier — garantie au niveau base de données.',
  },
  {
    route: '/pro',
    target: '[data-tour="stats-cards"]',
    placement: 'bottom',
    title: 'Vos 4 indicateurs du jour',
    desc: 'Demandes reçues, dossiers prioritaires, en attente, répondus. Le pouls du cabinet à chaque ouverture de l\'app.',
  },
  {
    route: '/pro',
    target: '[data-tour="top-prospects"]',
    placement: 'top',
    title: 'À traiter en priorité',
    desc: 'Les 5 prospects au score le plus élevé. Vous appelez ceux-là en premier — pas besoin de fouiller dans la masse.',
  },
  {
    route: '/pro/prospects',
    target: '[data-tour="prospects-filters"]',
    placement: 'bottom',
    title: 'Filtres + recherche',
    desc: 'Tous · Nouveaux · Prioritaires · À qualifier · Répondus. Avec recherche libre par nom, email, projet.',
  },
  {
    route: '/pro/prospects',
    target: '[data-tour="prospects-table"]',
    placement: 'top',
    title: 'Table dense bancaire',
    desc: 'Score · Prospect · Projet · Statut · Priorité · Reçu — tout en un coup d\'œil. Clic sur une ligne pour ouvrir la fiche.',
  },
  {
    route: '/pro/banks',
    target: '[data-tour="banks-table"]',
    placement: 'top',
    title: 'Suivi banques par dossier',
    desc: 'Une ligne par prospect avec les banques sollicitées et leur statut. Filtre par statut pour isoler les urgences.',
  },
  {
    route: '/pro/bilan',
    target: '[data-tour="bilan-kpis"]',
    placement: 'bottom',
    title: 'Bilan mensuel',
    desc: 'Acquisition + sources + résultats bancaires. Envoyé automatiquement par email chaque 1er du mois.',
  },
  {
    route: '/pro',
    placement: 'center',
    title: 'Vous êtes prêt',
    desc: 'Connectez votre Gmail depuis l\'onglet Sources pour démarrer l\'analyse de vos vrais emails. Le compte démo reste disponible pour explorer.',
    bullets: [
      'Connecter Gmail → onglet Sources',
      'Inviter un collègue → onglet Profil',
      'Personnaliser le scoring → onglet Profil',
      'Relancer cette visite depuis la sidebar',
    ],
  },
]

const STORAGE_KEY = 'bk_tour_completed_v2'
const SPOTLIGHT_PADDING = 8
const TOOLTIP_GAP = 16
const TOOLTIP_WIDTH = 360

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function GuidedTour() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; placement: Step['placement'] } | null>(null)
  const [ready, setReady] = useState(false)  // contrôle le fondu pendant la transition
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Init : auto-display si pas encore vu, ou ?tour=1 ──
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('tour') === '1') {
      const url = new URL(window.location.href)
      url.searchParams.delete('tour')
      window.history.replaceState({}, '', url.toString())
      setStepIdx(0)
      setOpen(true)
      return
    }

    const completed = window.localStorage.getItem(STORAGE_KEY)
    if (!completed && pathname === '/pro') {
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [pathname])

  // ── Navigation entre routes selon l'étape ──
  useEffect(() => {
    if (!open) return
    const step = STEPS[stepIdx]
    if (step.route && step.route !== pathname) {
      router.push(step.route)
    }
  }, [stepIdx, open, pathname, router])

  // ── Position du spotlight + tooltip ──
  //  Séparation nette :
  //   - À chaque step : on cherche l'élément, on scrolle UNE fois, on mesure.
  //   - Sur resize/scroll utilisateur : on RE-MESURE seulement (jamais re-scroll).
  useLayoutEffect(() => {
    if (!open) return
    const step = STEPS[stepIdx]

    if (!step.target || step.placement === 'center') {
      setRect(null)
      setTooltipPos(null)
      setReady(true)
      return
    }

    let cancelled = false
    let retries = 0
    const MAX_RETRIES = 20  // ~2 secondes max
    setReady(false)

    // Mesure pure — sans scroll. Réutilisée par les listeners.
    const measure = () => {
      if (cancelled || !step.target) return
      const el = document.querySelector(step.target) as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      const spotlight: SpotlightRect = {
        top: r.top - SPOTLIGHT_PADDING,
        left: r.left - SPOTLIGHT_PADDING,
        width: r.width + SPOTLIGHT_PADDING * 2,
        height: r.height + SPOTLIGHT_PADDING * 2,
      }
      setRect(spotlight)
      setTooltipPos(computeTooltipPosition(spotlight, step.placement ?? 'bottom'))
    }

    // Init : attend que l'élément soit monté, scrolle une fois, puis mesure.
    const init = () => {
      if (cancelled || !step.target) return
      const el = document.querySelector(step.target) as HTMLElement | null
      if (!el) {
        if (retries >= MAX_RETRIES) { setRect(null); setTooltipPos(null); setReady(true); return }
        retries++
        setTimeout(init, 100)
        return
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Laisse le scroll smooth se terminer, puis mesure + affiche
      setTimeout(() => {
        if (cancelled) return
        measure()
        setReady(true)
      }, 420)
    }

    init()

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [stepIdx, open, pathname])

  // ── Gestion ESC pour fermer ──
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, stepIdx])

  function markCompleted() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    }
  }

  function close() {
    markCompleted()
    setOpen(false)
  }

  function next() {
    if (stepIdx >= STEPS.length - 1) {
      close()
      return
    }
    setStepIdx(stepIdx + 1)
  }

  function prev() {
    if (stepIdx === 0) return
    setStepIdx(stepIdx - 1)
  }

  if (!open) return null

  const step = STEPS[stepIdx]
  const progress = ((stepIdx + 1) / STEPS.length) * 100
  const isFirst = stepIdx === 0
  const isLast = stepIdx === STEPS.length - 1
  const isCentered = !step.target || step.placement === 'center'

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] pointer-events-none">

      {/* ── Backdrop avec trou (spotlight) ── */}
      {rect && !isCentered ? (
        <div
          className="absolute pointer-events-auto transition-all duration-500 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(10, 31, 92, 0.55)',
            borderRadius: 12,
            transitionProperty: 'top, left, width, height',
          }}
          onClick={close}
        >
          {/* Pulse anneau accent autour du spotlight */}
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: '0 0 0 2px rgba(59, 95, 224, 0.6), 0 0 24px rgba(59, 95, 224, 0.4)',
              animation: 'tour-pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 pointer-events-auto bg-navy/55 backdrop-blur-sm transition-opacity duration-300"
          onClick={close}
        />
      )}

      {/* ── Tooltip / Modal ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visite guidée — ${step.title}`}
        className="absolute pointer-events-auto bg-white rounded-2xl shadow-[0_24px_80px_rgba(10,31,92,0.32)] overflow-hidden ease-out"
        style={
          isCentered || !tooltipPos
            ? {
                top: '50%',
                left: '50%',
                transform: ready ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -48%) scale(0.98)',
                width: `min(${TOOLTIP_WIDTH + 60}px, calc(100vw - 32px))`,
                opacity: ready ? 1 : 0,
                transition: 'opacity 280ms ease-out, transform 280ms ease-out',
              }
            : {
                top: tooltipPos.top,
                left: tooltipPos.left,
                width: TOOLTIP_WIDTH,
                maxWidth: 'calc(100vw - 32px)',
                opacity: ready ? 1 : 0,
                transition: 'top 400ms cubic-bezier(0.22,1,0.36,1), left 400ms cubic-bezier(0.22,1,0.36,1), opacity 280ms ease-out',
              }
        }
      >

        {/* Progress bar */}
        <div className="h-1 bg-[#F3F4F6]">
          <div
            className="h-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
            Visite · {stepIdx + 1} / {STEPS.length}
          </p>
          <button
            onClick={close}
            className="text-[#9CA3AF] hover:text-navy transition-colors text-[11px] font-semibold"
            aria-label="Fermer"
          >
            Passer
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <h2 className="text-xl font-extrabold text-navy tracking-tightest mb-2 leading-tight">
            {step.title}
          </h2>
          <p className="text-[14px] text-[#374151] leading-relaxed mb-3">
            {step.desc}
          </p>

          {step.bullets && step.bullets.length > 0 && (
            <ul className="space-y-1.5 mt-3">
              {step.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#374151]">
                  <span className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer nav */}
        <div className="px-5 py-3 border-t border-[#F3F4F6] bg-[#F7F8FA] flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIdx ? 'w-5 bg-accent' : 'w-1.5 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
                }`}
                aria-label={`Étape ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={prev} className="text-xs font-semibold text-[#6B7280] hover:text-navy px-2 py-1 transition-colors">
                Précédent
              </button>
            )}
            <button
              onClick={next}
              className="btn-primary text-xs py-1.5 px-3.5"
            >
              {isLast ? 'Terminer' : 'Suivant'}
              {!isLast && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes tour-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(59, 95, 224, 0.6), 0 0 24px rgba(59, 95, 224, 0.4); }
          50%      { box-shadow: 0 0 0 2px rgba(59, 95, 224, 0.9), 0 0 32px rgba(59, 95, 224, 0.6); }
        }
      `}</style>
    </div>
  )
}

// ── Calcul de position du tooltip relatif au spotlight ──────────────────
//
//  Stratégie : on calcule la position et on vérifie qu'elle n'OVERLAPPE
//  JAMAIS le spotlight. Si elle overlap, on dock le tooltip dans le coin
//  opposé de l'écran (bas ou haut) qui laisse le plus de place visible.

function computeTooltipPosition(
  rect: SpotlightRect,
  placement: Step['placement'] = 'bottom',
): { top: number; left: number; placement: Step['placement'] } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = TOOLTIP_GAP
  const tooltipApproxHeight = 280

  // Espace disponible dans chaque direction (en pixels)
  const spaceBelow = vh - (rect.top + rect.height)
  const spaceAbove = rect.top
  const spaceRight = vw - (rect.left + rect.width)
  const spaceLeft  = rect.left

  // Détecte si une position overlap le rect
  const overlaps = (top: number, left: number) => {
    const tBottom = top + tooltipApproxHeight
    const tRight = left + TOOLTIP_WIDTH
    return !(tBottom < rect.top || top > rect.top + rect.height || tRight < rect.left || left > rect.left + rect.width)
  }

  // Place le tooltip selon placement souhaité — fallback intelligent
  function tryPlace(p: Step['placement']): { top: number; left: number; placement: Step['placement'] } | null {
    if (p === 'bottom') {
      if (spaceBelow < tooltipApproxHeight + margin + 16) return null
      const top = rect.top + rect.height + margin
      const left = clampLeft(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2)
      if (overlaps(top, left)) return null
      return { top, left, placement: 'bottom' }
    }
    if (p === 'top') {
      if (spaceAbove < tooltipApproxHeight + margin + 16) return null
      const top = rect.top - tooltipApproxHeight - margin
      const left = clampLeft(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2)
      if (overlaps(top, left)) return null
      return { top, left, placement: 'top' }
    }
    if (p === 'right') {
      if (spaceRight < TOOLTIP_WIDTH + margin + 16) return null
      const left = rect.left + rect.width + margin
      const top = clampTop(rect.top + rect.height / 2 - tooltipApproxHeight / 2)
      if (overlaps(top, left)) return null
      return { top, left, placement: 'right' }
    }
    if (p === 'left') {
      if (spaceLeft < TOOLTIP_WIDTH + margin + 16) return null
      const left = rect.left - TOOLTIP_WIDTH - margin
      const top = clampTop(rect.top + rect.height / 2 - tooltipApproxHeight / 2)
      if (overlaps(top, left)) return null
      return { top, left, placement: 'left' }
    }
    return null
  }

  function clampLeft(x: number) {
    return Math.max(16, Math.min(vw - TOOLTIP_WIDTH - 16, x))
  }
  function clampTop(y: number) {
    return Math.max(16, Math.min(vh - tooltipApproxHeight - 16, y))
  }

  // Essai 1 : placement souhaité + chaine de fallback
  const order: Step['placement'][] = [placement, 'bottom', 'top', 'right', 'left']
  const tried = new Set<string>()
  for (const p of order) {
    if (tried.has(p as string)) continue
    tried.add(p as string)
    const result = tryPlace(p)
    if (result) return result
  }

  // Dernier recours : on choisit le plus grand espace libre haut ou bas
  // et on dock le tooltip dans ce coin SANS overlap. Le spotlight reste visible.
  if (spaceBelow >= spaceAbove) {
    // Dock en bas — partie inférieure de l'écran
    const top = Math.max(rect.top + rect.height + margin, vh - tooltipApproxHeight - 16)
    const left = clampLeft(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2)
    return { top, left, placement: 'bottom' }
  } else {
    // Dock en haut — partie supérieure de l'écran
    const top = Math.min(rect.top - tooltipApproxHeight - margin, 16)
    const left = clampLeft(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2)
    return { top: Math.max(16, top), left, placement: 'top' }
  }
}
