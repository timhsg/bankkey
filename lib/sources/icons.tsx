// ════════════════════════════════════════════════════════════════════════
//  Icônes SVG des plateformes source — design propre et reconnaissable
//
//  Approche :
//  - Logos officiels (SVG) pour Gmail, Outlook, WhatsApp
//  - Monogrammes premium pour les marques sans SVG libre (Empruntis,
//    Meilleurtaux, Pretto, SeLoger, Leboncoin, BienIci, Aprico, Marketis)
//  - Icônes Lucide-style pour les catégories génériques (IMAP, web form,
//    webhook, forwarding)
//
//  Toutes les icônes ont la même taille (24x24) et sont parfaitement
//  centrées dans une box 36x36.
// ════════════════════════════════════════════════════════════════════════

import type { JSX } from 'react'

interface IconProps {
  className?: string
}

// ── EMAIL ───────────────────────────────────────────────────────────────

export const GmailIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export const OutlookIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0078D4" d="M21.66 4H10.34A2.34 2.34 0 0 0 8 6.34v.66H2v11.32A1.68 1.68 0 0 0 3.68 20H17v-3h6.34A2.34 2.34 0 0 0 24 14.66v-8.32A2.34 2.34 0 0 0 21.66 4z"/>
    <path fill="#fff" d="M21.5 8h-7v8h7a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5zm-1.5 6h-4v-4h4v4z"/>
    <circle fill="#0078D4" cx="6.5" cy="13.5" r="3"/>
    <circle fill="#fff" cx="6.5" cy="13.5" r="1.3"/>
  </svg>
)

export const ImapIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#475569" strokeWidth="1.6"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="#475569" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="18" cy="6" r="3" fill="#10b981"/>
    <path d="M16.5 6.5 17.5 7.5 19.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Monogramme générique (utilisé pour les marques sans logo SVG) ──

interface MonogramProps {
  className?: string
  letter: string
  bg: string
  size?: 'normal' | 'small'
}

const Monogram = ({ className = 'w-6 h-6', letter, bg, size = 'normal' }: MonogramProps) => (
  <div
    className={`${className} rounded-md flex items-center justify-center font-bold tracking-tight`}
    style={{
      background: bg,
      color: 'white',
      fontSize: size === 'small' ? '0.55rem' : '0.7rem',
      lineHeight: 1,
    }}
  >
    {letter}
  </div>
)

// ── AGRÉGATEURS ─────────────────────────────────────────────────────────

export const EmpruntisIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="E" bg="linear-gradient(135deg, #E63946 0%, #c1121f 100%)" />
)

export const MeilleurtauxIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="MT" bg="linear-gradient(135deg, #FF6B00 0%, #cc5500 100%)" size="small" />
)

export const PrettoIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="P" bg="linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%)" />
)

export const HelloPretIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="HP" bg="linear-gradient(135deg, #1D4ED8 0%, #1e3a8a 100%)" size="small" />
)

// ── PORTAILS ────────────────────────────────────────────────────────────

export const SeLogerIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="SL" bg="linear-gradient(135deg, #E20020 0%, #a8001a 100%)" size="small" />
)

export const LeBonCoinIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="lbc" bg="linear-gradient(135deg, #EB6E10 0%, #c2580d 100%)" size="small" />
)

export const BienIciIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="B" bg="linear-gradient(135deg, #00B89F 0%, #007a6a 100%)" />
)

// ── CRM ─────────────────────────────────────────────────────────────────

export const AprIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="A" bg="linear-gradient(135deg, #475569 0%, #1e293b 100%)" />
)

export const MarketisIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="M" bg="linear-gradient(135deg, #1E3A8A 0%, #0f172a 100%)" />
)

export const LogicielCourtierIcon = ({ className }: IconProps) => (
  <Monogram className={className} letter="LC" bg="linear-gradient(135deg, #334155 0%, #0f172a 100%)" size="small" />
)

// ── DIRECT ──────────────────────────────────────────────────────────────

export const WebFormIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2.5" fill="#0EA5E9" />
    <rect x="6" y="7" width="12" height="1.6" rx="0.8" fill="white" />
    <rect x="6" y="11" width="9" height="1.6" rx="0.8" fill="white" opacity="0.9" />
    <rect x="6" y="15" width="6" height="1.6" rx="0.8" fill="white" opacity="0.8" />
  </svg>
)

export const WhatsAppIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#25D366" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
    <path fill="#25D366" d="M20.5 3.5A11.85 11.85 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89A11.82 11.82 0 0 0 20.5 3.5zM12.05 21.78a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26C2.17 6.45 6.6 2 12.05 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89z"/>
  </svg>
)

export const WebhookIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#1e293b"/>
    <path d="M8.5 13.5c-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7" stroke="#10b981" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8.5" cy="16.2" r="1.2" fill="#10b981"/>
    <path d="M15.5 10.5c1.5 0 2.7-1.2 2.7-2.7S17 5.1 15.5 5.1 12.8 6.3 12.8 7.8" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="15.5" cy="7.8" r="1.2" fill="#3b82f6"/>
    <path d="M11.2 7.8 14 13" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M11.2 16.2 14 11" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

export const ForwardingIcon = ({ className = 'w-6 h-6' }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="5" fill="#0f172a"/>
    <rect x="4.5" y="7" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.3"/>
    <path d="m16.5 8.5-5.5 3.5L5.5 8.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M16 11.5h3M19 11.5l-1.5-1.5M19 11.5l-1.5 1.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

  // ── Réseaux / enseignes de courtage FR ──
  cafpi:                ({ className }: IconProps) => <Monogram className={className} letter="C"   bg="linear-gradient(135deg, #E2001A 0%, #a8001a 100%)" />,
  vousfinancer:         ({ className }: IconProps) => <Monogram className={className} letter="VF"  bg="linear-gradient(135deg, #F39200 0%, #c2740a 100%)" size="small" />,
  lacentrale_financement: ({ className }: IconProps) => <Monogram className={className} letter="LCF" bg="linear-gradient(135deg, #1B2A4A 0%, #0f172a 100%)" size="small" />,
  ymanci:               ({ className }: IconProps) => <Monogram className={className} letter="Y"   bg="linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" />,
  cyberpret:            ({ className }: IconProps) => <Monogram className={className} letter="CP"  bg="linear-gradient(135deg, #0EA5A4 0%, #0b7a79 100%)" size="small" />,
  acecredit:            ({ className }: IconProps) => <Monogram className={className} letter="ACE" bg="linear-gradient(135deg, #1D4ED8 0%, #1e3a8a 100%)" size="small" />,

  // ── Portails FR additionnels ──
  logicimmo:            ({ className }: IconProps) => <Monogram className={className} letter="LI"  bg="linear-gradient(135deg, #E2007A 0%, #a8005c 100%)" size="small" />,
  pap:                  ({ className }: IconProps) => <Monogram className={className} letter="PAP" bg="linear-gradient(135deg, #334155 0%, #0f172a 100%)" size="small" />,

  // ── Suisse ──
  homegate:             ({ className }: IconProps) => <Monogram className={className} letter="HG"  bg="linear-gradient(135deg, #E30613 0%, #a8001a 100%)" size="small" />,
  immoscout24ch:        ({ className }: IconProps) => <Monogram className={className} letter="IS"  bg="linear-gradient(135deg, #D40000 0%, #990000 100%)" size="small" />,
  comparis:             ({ className }: IconProps) => <Monogram className={className} letter="C"   bg="linear-gradient(135deg, #00A0E1 0%, #007bb0 100%)" />,
  moneypark:            ({ className }: IconProps) => <Monogram className={className} letter="MP"  bg="linear-gradient(135deg, #003B71 0%, #0f172a 100%)" size="small" />,
  hypotheke:            ({ className }: IconProps) => <Monogram className={className} letter="H"   bg="linear-gradient(135deg, #0F766E 0%, #115e59 100%)" />,
  newhome:              ({ className }: IconProps) => <Monogram className={className} letter="NH"  bg="linear-gradient(135deg, #E2001A 0%, #a8001a 100%)" size="small" />,
  realadvisor:          ({ className }: IconProps) => <Monogram className={className} letter="RA"  bg="linear-gradient(135deg, #2563EB 0%, #1e3a8a 100%)" size="small" />,
  anibis:               ({ className }: IconProps) => <Monogram className={className} letter="A"   bg="linear-gradient(135deg, #7AB800 0%, #4d7a00 100%)" />,
  immomig:              ({ className }: IconProps) => <Monogram className={className} letter="IM"  bg="linear-gradient(135deg, #0EA5E9 0%, #0369a1 100%)" size="small" />,
}
