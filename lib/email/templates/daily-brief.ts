import type { DailyBriefData, DailyBriefLead } from '../compute-daily-brief'

// ════════════════════════════════════════════════════════════════════════
//  Template email — Brief matinal BankKey
//  Design : navy/accent, sobre, mobile-first, table HTML (compat email).
// ════════════════════════════════════════════════════════════════════════

const NAVY = '#0A1F5C'
const ACCENT = '#3b5fe0'
const INK = '#0A0F1E'
const MUTED = '#6B7280'
const BORDER = '#E5E7EB'
const BG = '#F7F8FA'

function tempColor(t: DailyBriefLead['temperature']): { bg: string; fg: string; label: string } {
  if (t === 'hot')  return { bg: '#ECFDF5', fg: '#059669', label: 'Prioritaire' }
  if (t === 'warm') return { bg: '#FFFBEB', fg: '#B45309', label: 'À qualifier' }
  return { bg: '#F1F5F9', fg: '#64748B', label: 'À examiner' }
}

function fmtAmount(v: number | null): string {
  if (v == null) return ''
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' €'
}

export function renderDailyBriefHTML(d: DailyBriefData): string {
  const headline =
    d.hotPendingCount > 0
      ? `${d.hotPendingCount} dossier${d.hotPendingCount > 1 ? 's' : ''} prioritaire${d.hotPendingCount > 1 ? 's' : ''} à appeler`
      : `${d.newCount} nouvelle${d.newCount > 1 ? 's' : ''} demande${d.newCount > 1 ? 's' : ''} à qualifier`

  const rows = d.leads.map(lead => {
    const tc = tempColor(lead.temperature)
    const meta = [lead.city, lead.projet].filter(Boolean).join(' · ')
    const amount = fmtAmount(lead.amount)
    return `
      <tr>
        <td style="padding:14px 16px;border-bottom:1px solid ${BORDER};">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:top;">
                <div style="font-weight:700;color:${INK};font-size:15px;">${lead.name}</div>
                ${meta ? `<div style="color:${MUTED};font-size:13px;margin-top:2px;">${meta}</div>` : ''}
                ${amount ? `<div style="color:${NAVY};font-size:13px;font-weight:700;margin-top:2px;">${amount}</div>` : ''}
              </td>
              <td style="vertical-align:top;text-align:right;white-space:nowrap;">
                <div style="display:inline-block;font-weight:800;color:${NAVY};font-size:20px;line-height:1;">${lead.score}<span style="font-size:11px;color:${MUTED};font-weight:600;">/100</span></div>
                <div style="margin-top:6px;"><span style="display:inline-block;background:${tc.bg};color:${tc.fg};font-size:11px;font-weight:700;padding:2px 8px;border-radius:100px;">${tc.label}</span></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Votre brief BankKey</title></head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BG};padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#fff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,${NAVY},${ACCENT});padding:24px 24px 20px;">
          <div style="color:#fff;font-weight:800;font-size:17px;letter-spacing:-0.02em;">BankKey</div>
          <div style="color:#C7D2FE;font-size:13px;margin-top:10px;text-transform:capitalize;">${d.dateLabel}</div>
          <div style="color:#fff;font-weight:800;font-size:22px;line-height:1.2;margin-top:4px;letter-spacing:-0.02em;">
            ${d.firstName ? `Bonjour ${d.firstName},<br>` : ''}${headline}
          </div>
        </td></tr>

        <!-- Résumé -->
        <tr><td style="padding:18px 24px 8px;">
          <div style="color:${MUTED};font-size:14px;line-height:1.5;">
            ${d.newCount > 0 ? `<strong style="color:${INK};">${d.newCount}</strong> demande${d.newCount > 1 ? 's' : ''} reçue${d.newCount > 1 ? 's' : ''} depuis hier. ` : ''}Voici vos dossiers à traiter en priorité ce matin.
          </div>
        </td></tr>

        <!-- Liste -->
        <tr><td style="padding:8px 8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
            ${rows}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:20px 24px 8px;" align="center">
          <a href="${d.appUrl}/pro" style="display:inline-block;background:${NAVY};color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:8px;">
            Ouvrir mon tableau de bord →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 24px 24px;">
          <div style="border-top:1px solid ${BORDER};padding-top:16px;color:${MUTED};font-size:12px;line-height:1.5;">
            Brief envoyé chaque matin par BankKey${d.agencyName ? ` pour ${d.agencyName}` : ''}.<br>
            <a href="${d.appUrl}/pro/settings" style="color:${ACCENT};text-decoration:none;">Gérer mes notifications</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

export function renderDailyBriefText(d: DailyBriefData): string {
  const lines: string[] = []
  lines.push(`BankKey — Brief du ${d.dateLabel}`)
  lines.push('')
  if (d.firstName) lines.push(`Bonjour ${d.firstName},`)
  if (d.newCount > 0) lines.push(`${d.newCount} demande(s) reçue(s) depuis hier.`)
  if (d.hotPendingCount > 0) lines.push(`${d.hotPendingCount} dossier(s) prioritaire(s) à appeler.`)
  lines.push('')
  lines.push('À traiter en priorité :')
  for (const l of d.leads) {
    const parts = [`- ${l.name} (${l.score}/100)`]
    if (l.city) parts.push(l.city)
    if (l.amount) parts.push(fmtAmount(l.amount))
    lines.push(parts.join(' · '))
  }
  lines.push('')
  lines.push(`Ouvrir le tableau de bord : ${d.appUrl}/pro`)
  return lines.join('\n')
}
