// ════════════════════════════════════════════════════════════════════════
//  Icônes SVG des plateformes source — vraies couleurs de marque
//  Utilisées sur /pro/sources pour reconnaissance immédiate
// ════════════════════════════════════════════════════════════════════════

import type { JSX } from 'react'

interface IconProps {
  className?: string
}

// ── EMAIL ───────────────────────────────────────────────────────────────

export const GmailIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export const OutlookIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="#0078D4">
    <path d="M7 12.5a3.5 3.5 0 0 1 0-7 3.5 3.5 0 0 1 0 7zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    <path d="M2 5.5v13c0 .55.45 1 1 1h7.5v-15H3c-.55 0-1 .45-1 1zm.5 13V6h7.5v12.5H2.5z"/>
    <path d="M22.5 4l-9 1.5v12.5L22 19.5c.83 0 1.5-.67 1.5-1.5V5.5c0-.83-.67-1.5-1.5-1.5z" opacity="0.85"/>
  </svg>
)

export const ImapIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <path d="M6 12h4M14 16h4" stroke="#94a3b8" strokeWidth="1"/>
  </svg>
)

// ── AGRÉGATEURS ─────────────────────────────────────────────────────────

export const EmpruntisIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#E63946] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">E</span>
  </div>
)

export const MeilleurtauxIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#FF6B00] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">M</span>
  </div>
)

export const PrettoIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#7C3AED] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">P</span>
  </div>
)

export const HelloPretIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#1D4ED8] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">H</span>
  </div>
)

// ── PORTAILS ────────────────────────────────────────────────────────────

export const SeLogerIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#E20020] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">SL</span>
  </div>
)

export const LeBonCoinIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#EB6E10] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">lbc</span>
  </div>
)

export const BienIciIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#00B89F] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">B!</span>
  </div>
)

// ── CRM ─────────────────────────────────────────────────────────────────

export const AprIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-slate-700 flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">A</span>
  </div>
)

export const MarketisIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-[#1E3A8A] flex items-center justify-center`}>
    <span className="text-white text-[10px] font-black tracking-tighter">M</span>
  </div>
)

export const LogicielCourtierIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <div className={`${className} rounded-md bg-slate-800 flex items-center justify-center`}>
    <span className="text-white text-[9px] font-black tracking-tighter">LC</span>
  </div>
)

// ── DIRECT ──────────────────────────────────────────────────────────────

export const WebFormIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <line x1="7" y1="9" x2="17" y2="9"/>
    <line x1="7" y1="13" x2="14" y2="13"/>
    <line x1="7" y1="17" x2="11" y2="17"/>
  </svg>
)

export const WhatsAppIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

export const WebhookIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16.98 4.43-2.5a2 2 0 0 0-2-3.46L17 13a8 8 0 0 0-15 1"/>
    <path d="m10 17.49 3.5-2.02a2 2 0 0 1 2.74.74l5.6 9.7"/>
    <path d="m18 16.98-7.21 4.16a2 2 0 1 1-2-3.46l1.94-1.12"/>
  </svg>
)

export const ForwardingIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    <polyline points="14 4 18 4 18 8" stroke="#10b981" strokeWidth="1.75"/>
    <line x1="14" y1="8" x2="18" y2="4" stroke="#10b981" strokeWidth="1.75"/>
  </svg>
)

// ── Registry ────────────────────────────────────────────────────────────

export const SOURCE_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  gmail:                GmailIcon,
  outlook:              OutlookIcon,
  imap:                 ImapIcon,
  empruntis:            EmpruntisIcon,
  meilleurtaux:         MeilleurtauxIcon,
  pretto:               PrettoIcon,
  'helloprêt':          HelloPretIcon,
  seloger:              SeLogerIcon,
  leboncoin:            LeBonCoinIcon,
  bienici:              BienIciIcon,
  aprico:               AprIcon,
  marketis:             MarketisIcon,
  logiciel_courtier:    LogicielCourtierIcon,
  web_form:             WebFormIcon,
  whatsapp:             WhatsAppIcon,
  webhook:              WebhookIcon,
  forwarding:           ForwardingIcon,
}
