// ════════════════════════════════════════════════════════════════════════
//  Template HTML du digest mensuel BankKey
//  Inline styles uniquement (compat Gmail/Outlook/Apple Mail)
// ════════════════════════════════════════════════════════════════════════

export interface MonthlyDigestData {
  // Identité
  brokerFirstName: string | null
  agencyName: string | null
  monthLabel: string                // "Mai 2026"

  // Acquisition
  totalProspects: number
  hotProspects: number
  filteredProspects: number
  repliedCount: number
  responseRate: number              // 0-100

  // Comparaison mois précédent
  prevTotal: number
  prevHot: number

  // Sources
  topSources: Array<{ name: string; count: number; pct: number }>

  // Banques
  banksSubmitted: number
  accepted: number
  rejected: number
  counter: number
  avgRate: number | null            // %
  totalLoanAmount: number           // EUR

  // URL retour
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
  red: '#dc2626',
  redBg: '#fef2f2',
  brand: '#0f172a',
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} M€`
  if (n >= 1000) return `${Math.round(n / 1000)} k€`
  return `${Math.round(n)} €`
}

function deltaBadge(curr: number, prev: number): string {
  if (prev === 0) return ''
  const diff = curr - prev
  const sign = diff > 0 ? '+' : ''
  const color = diff > 0 ? COLOR.emerald : diff < 0 ? COLOR.red : COLOR.textFaint
  return `<span style="color:${color};font-size:11px;font-weight:600;margin-left:6px;">${sign}${diff}</span>`
}

export function renderMonthlyDigestHTML(d: MonthlyDigestData): string {
  const greeting = d.brokerFirstName ? `Bonjour ${d.brokerFirstName}` : 'Bonjour'
  const agencyLine = d.agencyName ? ` (${d.agencyName})` : ''

  return `
<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Votre bilan ${d.monthLabel} — BankKey</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${COLOR.text};">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="background:${COLOR.bg};padding:40px 20px;">
  <tr>
    <td align="center">

      <!-- Container principal -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border:1px solid ${COLOR.border};border-radius:16px;overflow:hidden;">

        <!-- En-tête avec logo -->
        <tr>
          <td style="padding:32px 32px 0 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="width:28px;height:28px;background:${COLOR.brand};border-radius:6px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:bold;font-size:11px;letter-spacing:-0.5px;">BK</td>
                      <td style="padding-left:10px;font-weight:600;color:${COLOR.text};font-size:15px;letter-spacing:-0.3px;">BankKey</td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="color:${COLOR.textFaint};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                  Bilan mensuel
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Titre principal -->
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <p style="margin:0;color:${COLOR.textFaint};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">${d.monthLabel}</p>
            <h1 style="margin:6px 0 0 0;font-size:28px;font-weight:600;color:${COLOR.text};letter-spacing:-0.5px;line-height:1.2;">${greeting}${agencyLine}</h1>
            <p style="margin:8px 0 0 0;color:${COLOR.textMuted};font-size:15px;line-height:1.5;">
              Voici votre récap du mois en chiffres.
            </p>
          </td>
        </tr>

        ${d.totalProspects === 0 ? `
        <!-- Empty state -->
        <tr>
          <td style="padding:24px 32px 32px 32px;">
            <div style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:12px;padding:32px;text-align:center;">
              <p style="margin:0;color:${COLOR.text};font-size:14px;font-weight:600;">Mois calme côté prospects</p>
              <p style="margin:8px 0 0 0;color:${COLOR.textMuted};font-size:13px;line-height:1.5;">
                Aucune activité enregistrée en ${d.monthLabel}. Dès qu'un email arrive ou que vous ajoutez un prospect manuellement, votre bilan se remplit.
              </p>
            </div>
          </td>
        </tr>
        ` : `

        <!-- ─── KPIs Acquisition ─── -->
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <p style="margin:0 0 12px 0;color:${COLOR.textFaint};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Acquisition</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <div style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:10px;padding:14px;">
                    <p style="margin:0;color:${COLOR.textFaint};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Prospects reçus</p>
                    <p style="margin:6px 0 0 0;font-size:26px;font-weight:600;color:${COLOR.text};letter-spacing:-0.5px;">
                      ${d.totalProspects}${deltaBadge(d.totalProspects, d.prevTotal)}
                    </p>
                  </div>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <div style="background:${COLOR.emeraldBg};border:1px solid #a7f3d0;border-radius:10px;padding:14px;">
                    <p style="margin:0;color:${COLOR.emerald};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Prioritaires</p>
                    <p style="margin:6px 0 0 0;font-size:26px;font-weight:600;color:${COLOR.emerald};letter-spacing:-0.5px;">
                      ${d.hotProspects}${deltaBadge(d.hotProspects, d.prevHot)}
                    </p>
                  </div>
                </td>
              </tr>
              <tr><td colspan="2" height="8"></td></tr>
              <tr>
                <td style="padding-right:8px;" width="50%">
                  <div style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:10px;padding:14px;">
                    <p style="margin:0;color:${COLOR.textFaint};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Filtrés (spam, perso)</p>
                    <p style="margin:6px 0 0 0;font-size:26px;font-weight:600;color:${COLOR.textMuted};letter-spacing:-0.5px;">
                      ${d.filteredProspects}
                    </p>
                  </div>
                </td>
                <td style="padding-left:8px;" width="50%">
                  <div style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:10px;padding:14px;">
                    <p style="margin:0;color:${COLOR.textFaint};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Taux de réponse</p>
                    <p style="margin:6px 0 0 0;font-size:26px;font-weight:600;color:${COLOR.text};letter-spacing:-0.5px;">
                      ${d.responseRate}%
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${d.topSources.length > 0 ? `
        <!-- ─── Sources ─── -->
        <tr>
          <td style="padding:20px 32px 8px 32px;">
            <p style="margin:0 0 12px 0;color:${COLOR.textFaint};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Top sources de leads</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border:1px solid ${COLOR.border};border-radius:10px;overflow:hidden;">
              ${d.topSources.slice(0, 5).map((src, i) => `
                <tr ${i > 0 ? `style="border-top:1px solid ${COLOR.border};"` : ''}>
                  <td style="padding:12px 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="font-size:13px;font-weight:600;color:${COLOR.text};">${src.name}</td>
                        <td align="right" style="font-size:14px;font-weight:600;color:${COLOR.text};">${src.count} <span style="color:${COLOR.textFaint};font-weight:400;font-size:11px;">(${src.pct}%)</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              `).join('')}
            </table>
          </td>
        </tr>
        ` : ''}

        ${d.banksSubmitted > 0 || d.accepted > 0 || d.rejected > 0 ? `
        <!-- ─── Banques ─── -->
        <tr>
          <td style="padding:20px 32px 8px 32px;">
            <p style="margin:0 0 12px 0;color:${COLOR.textFaint};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Résultats bancaires</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-right:6px;" width="33%">
                  <div style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:10px;padding:12px;text-align:center;">
                    <p style="margin:0;color:${COLOR.textFaint};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Sollicitées</p>
                    <p style="margin:4px 0 0 0;font-size:22px;font-weight:600;color:${COLOR.text};letter-spacing:-0.3px;">${d.banksSubmitted}</p>
                  </div>
                </td>
                <td style="padding:0 3px;" width="33%">
                  <div style="background:${COLOR.emeraldBg};border:1px solid #a7f3d0;border-radius:10px;padding:12px;text-align:center;">
                    <p style="margin:0;color:${COLOR.emerald};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Accords</p>
                    <p style="margin:4px 0 0 0;font-size:22px;font-weight:600;color:${COLOR.emerald};letter-spacing:-0.3px;">${d.accepted}</p>
                  </div>
                </td>
                <td style="padding-left:6px;" width="33%">
                  <div style="background:${d.rejected > d.accepted ? COLOR.redBg : COLOR.bg};border:1px solid ${d.rejected > d.accepted ? '#fecaca' : COLOR.border};border-radius:10px;padding:12px;text-align:center;">
                    <p style="margin:0;color:${d.rejected > d.accepted ? COLOR.red : COLOR.textFaint};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Refus</p>
                    <p style="margin:4px 0 0 0;font-size:22px;font-weight:600;color:${d.rejected > d.accepted ? COLOR.red : COLOR.text};letter-spacing:-0.3px;">${d.rejected}</p>
                  </div>
                </td>
              </tr>
            </table>

            ${d.accepted > 0 ? `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:12px;">
              <tr>
                <td style="padding-right:6px;" width="50%">
                  <div style="background:${COLOR.emeraldBg};border:1px solid #a7f3d0;border-radius:10px;padding:14px;">
                    <p style="margin:0;color:${COLOR.emerald};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Taux moyen</p>
                    <p style="margin:6px 0 0 0;font-size:24px;font-weight:600;color:${COLOR.emerald};letter-spacing:-0.3px;">${d.avgRate ? d.avgRate.toFixed(2) + '%' : '—'}</p>
                  </div>
                </td>
                <td style="padding-left:6px;" width="50%">
                  <div style="background:${COLOR.brand};border-radius:10px;padding:14px;">
                    <p style="margin:0;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Montant accordé</p>
                    <p style="margin:6px 0 0 0;font-size:24px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">${d.totalLoanAmount > 0 ? formatMoney(d.totalLoanAmount) : '—'}</p>
                  </div>
                </td>
              </tr>
            </table>
            ` : ''}
          </td>
        </tr>
        ` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding:32px 32px 24px 32px;text-align:center;">
            <a href="${d.appUrl}/pro/bilan" style="display:inline-block;background:${COLOR.brand};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;letter-spacing:-0.2px;">
              Voir le bilan détaillé →
            </a>
          </td>
        </tr>
        `}

        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background:${COLOR.bg};border-top:1px solid ${COLOR.border};">
            <p style="margin:0;color:${COLOR.textMuted};font-size:12px;line-height:1.6;text-align:center;">
              Vous recevez cet email parce que vous utilisez BankKey.<br/>
              <a href="${d.appUrl}/pro/settings" style="color:${COLOR.textMuted};text-decoration:underline;">Gérer mes préférences</a>
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

/**
 * Version texte fallback (pour les clients mail qui n'affichent pas le HTML)
 */
export function renderMonthlyDigestText(d: MonthlyDigestData): string {
  return `
BankKey — Bilan ${d.monthLabel}

${d.brokerFirstName ? `Bonjour ${d.brokerFirstName},` : 'Bonjour,'}

Voici votre récap du mois en chiffres.

ACQUISITION
- Prospects reçus : ${d.totalProspects} (vs ${d.prevTotal} le mois précédent)
- Prioritaires : ${d.hotProspects} (vs ${d.prevHot})
- Filtrés automatiquement : ${d.filteredProspects}
- Taux de réponse : ${d.responseRate}%

${d.topSources.length > 0 ? `TOP SOURCES
${d.topSources.slice(0, 5).map(s => `- ${s.name} : ${s.count} (${s.pct}%)`).join('\n')}
` : ''}
${d.banksSubmitted > 0 ? `RÉSULTATS BANCAIRES
- Banques sollicitées : ${d.banksSubmitted}
- Accords : ${d.accepted}
- Contre-offres : ${d.counter}
- Refus : ${d.rejected}
${d.avgRate ? `- Taux moyen obtenu : ${d.avgRate.toFixed(2)}%` : ''}
${d.totalLoanAmount > 0 ? `- Montant total accordé : ${formatMoney(d.totalLoanAmount)}` : ''}
` : ''}

Voir le bilan détaillé : ${d.appUrl}/pro/bilan

—
BankKey · bankkey.ch
`.trim()
}
