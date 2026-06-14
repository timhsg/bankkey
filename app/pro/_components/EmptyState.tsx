import Link from 'next/link'
import type { ReactNode } from 'react'

// ════════════════════════════════════════════════════════════════════════
//  EmptyState — état vide élégant (principe "zero empty state")
//  Illustration minimaliste + titre + explication + action optionnelle.
//  Vibe sobre 21st.dev / GitHub : 1px borders, cercle doux, navy.
// ════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; href: string }
  className?: string
}

const DefaultIcon = (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
  </svg>
)

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`bg-white border border-[#E5E7EB] rounded-xl px-6 py-14 text-center ${className}`}>
      {/* Illustration : double cercle concentrique doux */}
      <div className="relative mx-auto mb-5 w-16 h-16">
        <div className="absolute inset-0 rounded-full bg-[#F7F8FA]" />
        <div className="absolute inset-2 rounded-full bg-white border border-[#E5E7EB] shadow-card flex items-center justify-center text-accent">
          {icon ?? DefaultIcon}
        </div>
      </div>

      <h3 className="text-sm font-extrabold text-navy mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">{description}</p>
      )}

      {action && (
        <Link href={action.href} className="btn-primary text-xs py-2 px-4 mt-6 inline-flex">
          {action.label}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}
