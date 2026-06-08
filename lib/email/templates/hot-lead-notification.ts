// ════════════════════════════════════════════════════════════════════════
//  Template HTML de la notification "lead chaud"
//  Envoyé immédiatement quand un prospect est créé avec score ≥ 70
// ════════════════════════════════════════════════════════════════════════

export interface HotLeadData {
  prospectId: string
  fullName: string
  score: number
  temperature: 'cold' | 'warm' | 'hot'
  city: string | null
  briefing: string | null
  need: string | null
  // Quelques infos de bancabilité pour le hero
  monthlyIncome: number | null
  downPayment: number | null
  employmentStatus: string | null
  appUrl: string
}

const COLOR = {
  text: '#0f172a',
  textMuted: '#475569',
  textFaint: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  emerald: '#059669',
  emeraldBg: '#ecfdf5',
  amber: '#d97706',
  amberBg: '#fffbeb',
  brand: '#0f172a',
}

function scoreColor(score: number): string {
  if (score >= 85) return COLOR.emerald
  if (score >= 70) return COLOR.amber
  return COLOR.textMuted
}

function employmentLabel(s: string | null): string | null {
  if (!s) return null
  const map: Record<string, string> = {
    cdi: 'CDI',
    fonctionnaire: 'Fonctionnaire',
    cdd: 'CDD',
    independant: 'Indépendant',
    retraite: 'Retraité',
    sans_emploi: 'Sans emploi',
  }
  return map[s] ?? s
}

function formatMoney(n: number | null): string | null {
  if (n === null || !Number.isFinite(n)) return null
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €'
}

export function renderHotLeadHTML(d: HotLeadData): string {
  const scoreCol = scoreColor(d.score)
  const employment = employmentLabel(d.employmentStatus)
  const income = formatMoney(d.monthlyIncome)
  const apport = formatMoney(d.downPayment)

  // Pastilles bancabilité (sous le score)
  const facts = [
    income ? { label: 'Revenus', value: `${income}/mois` } : null,
    apport ? { label: 'Apport', value: apport } : null,
    employment ? { label: 'Situation', value: employment } : null,
    d.city ? { label: 'Ville', value: d.city } : null,
  ].filter((x): x is { label: string; value: string } => x !== null)

  const factsHTML = facts.length
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:20px;">
         <tr>
           ${facts
             .map(
               (f) => `
             <td style="padding:8px 10px;background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:8px;text-align:center;">
               <p style="margin:0;font-size:10px;color:${COLOR.textFaint};text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${f.label}</p>
               <p style="margin:3px 0 0 0;font-size:13px;color:${COLOR.text};font-weight:600;">${escapeHtml(f.value)}</p>
             </td>
             ${facts.indexOf(f) < facts.length - 1 ? '<td style="width:6px;"></td>' : ''}
           `,
             )
             .join('')}
         </tr>
       </table>`
    : ''

  const briefingHTML = d.briefing
    ? `
      <tr>
        <td style="padding:0 32px 8px 32px;">
          <p style="margin:0;font-size:11px;font-weight:600;color:${COLOR.textFaint};text-transform:uppercase;letter-spacing:0.5px;">Brief 30 secondes</p>
          <p style="margin:8px 0 0 0;color:${COLOR.text};font-size:14px;line-height:1.6;">${escapeHtml(d.briefing)}</p>
        </td>
      </tr>
      ${
        d.need
          ? `
      <tr>
        <td style="padding:14px 32px 0 32px;">
          <div style="background:${COLOR.emeraldBg};border-left:3px solid ${COLOR.emerald};border-radius:6px;padding:12px 14px;">
            <p style="margin:0;font-size:11px;font-weight:600;color:${COLOR.emerald};text-transform:uppercase;letter-spacing:0.5px;">Besoin exprimé</p>
            <p style="margin:6px 0 0 0;font-size:13px;color:${COLOR.text};line-height:1.5;">${escapeHtml(d.need)}</p>
          </div>
        </td>
      </tr>`
          : ''
      }
    `
    : ''

  return `
<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lead chaud — ${escapeHtml(d.fullName)} · score ${d.score}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR.text};">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background:${COLOR.bg};padding:40px 20px;">
  <tr>
    <td align="center">

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background:#ffffff;border:1px solid ${COLOR.border};border-radius:16px;overflow:hidden;">

        <!-- Brand bar -->
        <tr>
          <td style="padding:28px 32px 0 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width:28px;height:28px;background:${COLOR.brand};border-radius:6px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:bold;font-size:11px;">BK</td>
                <td style="padding-left:10px;font-weight:600;color:${COLOR.text};font-size:15px;letter-spacing:-0.3px;">BankKey</td>
                <td align="right" style="font-size:11px;color:${COLOR.amber};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">🔥 Lead chaud</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero : score ring + nom -->
        <tr>
          <td style="padding:28px 32px 4px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width:90px;vertical-align:middle;">
                  <!-- Score "ring" simulé par un cercle plein coloré -->
                  <div style="width:84px;height:84px;border-radius:50%;background:${scoreCol};text-align:center;line-height:84px;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:-1px;">
                    ${d.score}
                  </div>
                </td>
                <td style="padding-left:18px;vertical-align:middle;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:${COLOR.textFaint};text-transform:uppercase;letter-spacing:0.5px;">Nouveau prospect qualifié</p>
                  <h1 style="margin:6px 0 0 0;font-size:24px;font-weight:600;color:${COLOR.text};letter-spacing:-0.5px;line-height:1.2;">
                    ${escapeHtml(d.fullName)}
                  </h1>
                  <p style="margin:4px 0 0 0;font-size:13px;color:${COLOR.textMuted};">Score bancabilité <strong style="color:${scoreCol};">${d.score}/100</strong></p>
                </td>
              </tr>
            </table>

            ${factsHTML}
          </td>
        </tr>

        <!-- Briefing -->
        ${briefingHTML
          ? `<tr><td style="padding:24px 0 0 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${briefingHTML}</table></td></tr>`
          : ''}

        <!-- CTA principal -->
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <a href="${d.appUrl}/pro/leads/${d.prospectId}" style="display:inline-block;background:${COLOR.brand};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:8px;letter-spacing:-0.2px;">
              Voir la fiche
            </a>
            <p style="margin:12px 0 0 0;color:${COLOR.textFaint};font-size:11px;">Rappelez sous 1 h pour maximiser vos chances</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:${COLOR.bg};border-top:1px solid ${COLOR.border};">
            <p style="margin:0;color:${COLOR.textMuted};font-size:11px;line-height:1.6;text-align:center;">
              Vous recevez cet email car vous avez activé les alertes lead chaud sur BankKey.<br/>
              <a href="${d.appUrl}/pro/settings#notifications" style="color:${COLOR.textMuted};text-decoration:underline;">Gérer mes notifications</a>
              &nbsp;·&nbsp;
              <a href="${d.appUrl}" style="color:${COLOR.textMuted};text-decoration:underline;">bankkey.ch</a>
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>

</body>
</html>
`.trim()
}

export function renderHotLeadText(d: HotLeadData): string {
  const employment = employmentLabel(d.employmentStatus)
  const income = formatMoney(d.monthlyIncome)
  const apport = formatMoney(d.downPayment)

  const lines: string[] = []
  lines.push(`🔥 Lead chaud — ${d.fullName} · score ${d.score}/100`)
  lines.push('')
  lines.push('Nouveau prospect qualifié sur BankKey.')
  lines.push('')

  const facts: string[] = []
  if (income) facts.push(`Revenus : ${income}/mois`)
  if (apport) facts.push(`Apport : ${apport}`)
  if (employment) facts.push(`Situation : ${employment}`)
  if (d.city) facts.push(`Ville : ${d.city}`)
  if (facts.length) {
    lines.push(facts.join(' · '))
    lines.push('')
  }

  if (d.briefing) {
    lines.push('Brief 30 secondes :')
    lines.push(d.briefing)
    lines.push('')
  }
  if (d.need) {
    lines.push(`Besoin exprimé : ${d.need}`)
    lines.push('')
  }

  lines.push(`Voir la fiche : ${d.appUrl}/pro/leads/${d.prospectId}`)
  lines.push('')
  lines.push('—')
  lines.push(`Gérer mes notifications : ${d.appUrl}/pro/settings#notifications`)

  return lines.join('\n')
}

// Subject line builder — exposé pour réutilisation côté route
export function buildHotLeadSubject(d: { fullName: string; score: number; city: string | null }): string {
  const cityPart = d.city ? ` · ${d.city}` : ''
  return `🔥 ${d.fullName} · score ${d.score}${cityPart}`
}

// ── Helpers ─────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
