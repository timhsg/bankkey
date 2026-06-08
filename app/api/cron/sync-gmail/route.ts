import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// ════════════════════════════════════════════════════════════════════════
//  Cron Vercel — synchronisation Gmail automatique
//  Appelé chaque jour à 08h00 UTC via la config vercel.json
//
//  Sécurité : Vercel envoie un header `Authorization: Bearer ${CRON_SECRET}`
//  Si CRON_SECRET n'est pas défini, on accepte (utile en dev) mais on log
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
  // 1. Vérification de la signature Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // 2. Récupérer tous les profils avec Gmail connecté ET abonnement actif
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, email, gmail_access_token, gmail_refresh_token, subscription_plan, subscription_status, trial_ends_at')
    .not('gmail_access_token', 'is', null)
    .not('gmail_refresh_token', 'is', null)

  if (error || !profiles?.length) {
    return NextResponse.json({
      ok: true,
      message: 'Aucun compte Gmail à synchroniser',
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
          'X-Internal-Request': 'true',
          'X-Cron-Secret': cronSecret ?? '',
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
