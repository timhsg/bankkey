import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { isCronAuthorized } from '@/lib/cron-auth'

// ════════════════════════════════════════════════════════════════════════
//  Cron — synchronisation automatique des boîtes mail (Gmail + Outlook + IMAP)
//  Déclenché par GitHub Actions (.github/workflows/cron.yml) toutes les 5 min.
//  (Nom de route historique « sync-gmail » conservé pour ne pas casser le cron,
//   mais traite désormais toutes les sources.)
//
//  Sécurité : header `Authorization: Bearer ${CRON_SECRET}` vérifié par
//  isCronAuthorized() (strict en production).
// ════════════════════════════════════════════════════════════════════════

export const runtime = 'nodejs'
export const maxDuration = 60

interface SyncResult {
  userId: string
  email: string
  processed: number
  error?: string
}

export async function GET(request: NextRequest) {
  // 1. Vérification de la signature Vercel Cron (strict en production)
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const cronSecret = process.env.CRON_SECRET

  const admin = createAdminClient()

  // 2. Récupérer tous les profils avec AU MOINS UNE source connectée
  //    (Gmail, Outlook ou IMAP), puis fusionner par id.
  //    ⚠️ Avant, on filtrait uniquement sur `gmail_access_token not null` :
  //    un courtier connecté UNIQUEMENT en Outlook (ou IMAP) n'était JAMAIS
  //    synchronisé automatiquement. On interroge donc chaque source à part.
  type LiteProfile = {
    id: string
    email: string
    subscription_plan: string | null
    subscription_status: string | null
    trial_ends_at: string | null
  }
  const SUBS_COLS = 'id, email, subscription_plan, subscription_status, trial_ends_at'
  const byId = new Map<string, LiteProfile>()

  // Gmail
  {
    const { data } = await admin
      .from('profiles')
      .select(SUBS_COLS)
      .not('gmail_access_token', 'is', null)
      .not('gmail_refresh_token', 'is', null)
    for (const p of data ?? []) byId.set(p.id, p as LiteProfile)
  }
  // Outlook (silencieux si la colonne n'existe pas — migration 010 non appliquée)
  {
    const { data } = await admin
      .from('profiles')
      .select(SUBS_COLS)
      .not('outlook_access_token', 'is', null)
    for (const p of data ?? []) byId.set(p.id, p as LiteProfile)
  }
  // IMAP (silencieux si la colonne n'existe pas — migration IMAP non appliquée)
  {
    const { data } = await admin
      .from('profiles')
      .select(SUBS_COLS)
      .not('imap_password', 'is', null)
    for (const p of data ?? []) byId.set(p.id, p as LiteProfile)
  }

  const profiles = Array.from(byId.values())
  if (!profiles.length) {
    return NextResponse.json({
      ok: true,
      message: 'Aucun compte à synchroniser',
      count: 0,
    })
  }

  // 3. Filtrer : seulement les comptes en essai actif OU pro actif
  const now = Date.now()
  const eligibleProfiles = profiles.filter(p => {
    if (p.subscription_plan === 'pro' && p.subscription_status === 'active') return true
    if (p.subscription_plan === 'pro' && p.subscription_status === 'trialing') return true
    if (p.trial_ends_at && new Date(p.trial_ends_at).getTime() > now) return true
    return false
  })

  // 4. Pour chaque profil éligible, déclencher la sync via l'endpoint /api/gmail/process
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? `https://${process.env.VERCEL_URL}`
  const results: SyncResult[] = []

  for (const profile of eligibleProfiles) {
    try {
      const res = await fetch(`${appUrl}/api/gmail/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Auth machine-à-machine : le process route n'accepte plus que
          // le Bearer CRON_SECRET (ou une session navigateur).
          'Authorization': `Bearer ${cronSecret ?? ''}`,
        },
        body: JSON.stringify({ userId: profile.id }),
      })

      if (res.ok) {
        const data = await res.json()
        results.push({
          userId: profile.id,
          email: profile.email,
          processed: data.processed ?? 0,
        })
      } else {
        const errText = await res.text()
        results.push({
          userId: profile.id,
          email: profile.email,
          processed: 0,
          error: errText.slice(0, 200),
        })
      }
    } catch (err) {
      results.push({
        userId: profile.id,
        email: profile.email,
        processed: 0,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      })
    }
  }

  // 5. Statistiques
  const totalProcessed = results.reduce((s, r) => s + r.processed, 0)
  const errors = results.filter(r => r.error).length

  // Log dans la console Vercel pour traçabilité
  console.log(`[cron sync-gmail] Cabinets traités : ${results.length} | Emails analysés : ${totalProcessed} | Erreurs : ${errors}`)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    cabinets_processed: results.length,
    emails_analyzed: totalProcessed,
    errors,
    details: results,
  })
}
