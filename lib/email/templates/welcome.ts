// ════════════════════════════════════════════════════════════════════════
//  Template HTML de l'email de bienvenue
//  Envoyé après création de compte courtier
// ════════════════════════════════════════════════════════════════════════

export interface WelcomeData {
  firstName?: string | null
  agencyName?: string | null
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
  brand: '#0f172a',
}

export function renderWelcomeHTML(d: WelcomeData): string {
  const greeting = d.firstName ? `Bonjour ${d.firstName}` : 'Bienvenue'

  return `
<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bienvenue dans BankKey</title>
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
              </tr>
            </table>
          </td>
        </tr>

        <!-- Titre -->
        <tr>
          <td style="padding:32px 32px 8px 32px;">
            <h1 style="margin:0;font-size:30px;font-weight:600;color:${COLOR.text};letter-spacing:-0.6px;line-height:1.2;">
              ${greeting}.
            </h1>
            <p style="margin:14px 0 0 0;color:${COLOR.textMuted};font-size:15px;line-height:1.6;">
              Vous venez de créer votre compte BankKey. Voici comment démarrer en moins de 10 minutes.
            </p>
          </td>
        </tr>

        <!-- 3 étapes -->
        <tr>
          <td style="padding:24px 32px 8px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${[
                {
                  n: '1',
                  title: 'Complétez votre profil',
                  desc: 'Nom, cabinet, signature email. BankKey utilisera ces infos pour personnaliser vos réponses automatiques.',
                  link: '/pro/settings',
                  cta: 'Compléter mon profil',
                },
                {
                  n: '2',
                  title: 'Connectez votre Gmail',
                  desc: 'Lecture seule, sécurisée. BankKey lit vos emails entrants et qualifie chaque prospect en 60 secondes.',
                  link: '/pro/sources',
                  cta: 'Connecter Gmail',
                },
                {
                  n: '3',
                  title: 'Personnalisez le scoring',
                  desc: 'Définissez vos critères de bancabilité prioritaires. Le score s\'adapte à vos préférences cabinet.',
                  link: '/pro/settings',
                  cta: 'Régler le scoring',
                },
              ].map((step, i) => `
              <tr>
                <td ${i > 0 ? `style="padding-top:12px;"` : ''}>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${COLOR.bg};border:1px solid ${COLOR.border};border-radius:12px;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="width:28px;vertical-align:top;">
                              <div style="width:24px;height:24px;background:${COLOR.brand};border-radius:50%;text-align:center;color:#ffffff;font-weight:700;font-size:12px;line-height:24px;">${step.n}</div>
                            </td>
                            <td style="padding-left:12px;">
                              <p style="margin:0;font-size:14px;font-weight:600;color:${COLOR.text};line-height:1.4;">${step.title}</p>
                              <p style="margin:4px 0 8px 0;color:${COLOR.textMuted};font-size:13px;line-height:1.5;">${step.desc}</p>
                              <a href="${d.appUrl}${step.link}" style="color:${COLOR.text};font-size:12px;font-weight:600;text-decoration:underline;">${step.cta} →</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              `).join('')}
            </table>
          </td>
        </tr>

        <!-- CTA principal -->
        <tr>
          <td style="padding:24px 32px;text-align:center;">
            <a href="${d.appUrl}/pro/onboarding" style="display:inline-block;background:${COLOR.brand};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:8px;letter-spacing:-0.2px;">
              Démarrer l'onboarding guidé
            </a>
            <p style="margin:12px 0 0 0;color:${COLOR.textFaint};font-size:11px;">Configuration en 3 minutes</p>
          </td>
        </tr>

        <!-- Help / Contact -->
        <tr>
          <td style="padding:0 32px 32px 32px;">
            <div style="background:${COLOR.emeraldBg};border:1px solid #a7f3d0;border-radius:10px;padding:16px;">
              <p style="margin:0;color:${COLOR.text};font-size:13px;line-height:1.6;">
                <strong style="color:${COLOR.emerald};">Une question ?</strong> Répondez simplement à cet email. Nous lisons et répondons sous 24 h ouvrées.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:${COLOR.bg};border-top:1px solid ${COLOR.border};">
            <p style="margin:0;color:${COLOR.textMuted};font-size:11px;line-height:1.6;text-align:center;">
              BankKey · Qualification automatique des leads crédit immobilier<br/>
              <a href="${d.appUrl}" style="color:${COLOR.textMuted};text-decoration:underline;">bankkey.ch</a>
              &nbsp;·&nbsp;
              <a href="${d.appUrl}/privacy" style="color:${COLOR.textMuted};text-decoration:underline;">Confidentialité</a>
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

export function renderWelcomeText(d: WelcomeData): string {
  return `
${d.firstName ? `Bonjour ${d.firstName}` : 'Bienvenue'}.

Vous venez de créer votre compte BankKey. Voici comment démarrer en moins de 10 minutes :

1. Complétez votre profil
   Nom, cabinet, signature email. BankKey utilisera ces infos pour personnaliser vos réponses.
   ${d.appUrl}/pro/settings

2. Connectez votre Gmail
   Lecture seule, sécurisée. BankKey lit vos emails entrants et qualifie chaque prospect en 60 secondes.
   ${d.appUrl}/pro/sources

3. Personnalisez le scoring
   Définissez vos critères de bancabilité prioritaires.
   ${d.appUrl}/pro/settings

Démarrer l'onboarding guidé : ${d.appUrl}/pro/onboarding

Une question ? Répondez simplement à cet email — nous lisons et répondons sous 24 h ouvrées.

—
BankKey · bankkey.ch
`.trim()
}
