import type { SupabaseClient } from '@supabase/supabase-js'

// ════════════════════════════════════════════════════════════════════════
//  Brief matinal — données pour l'email quotidien du courtier
//  Objectif rétention : "X dossiers vous attendent ce matin".
//  Ne s'envoie QUE s'il y a au moins 1 dossier actionnable (sinon on
//  n'entraîne pas le courtier à ignorer nos emails).
// ════════════════════════════════════════════════════════════════════════

export interface DailyBriefLead {
  id: string
  name: string
  score: number
  temperature: 'cold' | 'warm' | 'hot'
  projet: string
  amount: number | null
  source: string
  city: string | null
}

export interface DailyBriefData {
  firstName: string | null
  agencyName: string | null
  dateLabel: string
  newCount: number          // reçus depuis 24h
  hotPendingCount: number   // prioritaires non traités
  leads: DailyBriefLead[]   // top à appeler (max 5)
  appUrl: string
}

interface ProspectRow {
  id: string
  email_from_name: string | null
  status: string
  received_at: string | null
  created_at: string
  scoring: { score?: number; temperature?: string } | null
  qualification: { firstName?: string; lastName?: string; description?: string; price?: number; address?: string } | null
  detected_source: { sourceName?: string } | null
}

interface ProfileRow {
  email: string
  broker_memory: { fullName?: string; agencyName?: string } | null
}

export async function computeDailyBrief(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  userId: string,
  appUrl: string,
): Promise<DailyBriefData | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, broker_memory')
    .eq('id', userId)
    .single<ProfileRow>()

  if (!profile) return null

  // Prospects encore à traiter (nouveaux ou vus, pas répondus/archivés/filtrés)
  const { data: rows } = await supabase
    .from('prospects')
    .select('id, email_from_name, status, received_at, created_at, scoring, qualification, detected_source')
    .eq('user_id', userId)
    .in('status', ['new', 'viewed'])
    .order('received_at', { ascending: false, nullsFirst: false })
    .limit(100)

  const prospects = (rows ?? []) as ProspectRow[]

  // Reçus depuis 24h
  const since = Date.now() - 24 * 60 * 60 * 1000
  const newCount = prospects.filter(p => {
    const t = new Date(p.received_at ?? p.created_at).getTime()
    return t >= since
  }).length

  // Prioritaires (hot) non traités
  const hotPending = prospects.filter(p => p.scoring?.temperature === 'hot')

  // Rien d'actionnable → pas d'email (anti-spam)
  if (newCount === 0 && hotPending.length === 0) return null

  // Top à appeler : trie par score décroissant, max 5
  const top = [...prospects]
    .sort((a, b) => (b.scoring?.score ?? 0) - (a.scoring?.score ?? 0))
    .slice(0, 5)
    .map<DailyBriefLead>(p => {
      const q = p.qualification
      const name = q?.firstName
        ? `${q.firstName}${q.lastName ? ' ' + q.lastName : ''}`
        : p.email_from_name || 'Prospect'
      return {
        id: p.id,
        name,
        score: p.scoring?.score ?? 0,
        temperature: (p.scoring?.temperature as DailyBriefLead['temperature']) ?? 'cold',
        projet: q?.description ?? '',
        amount: q?.price ?? null,
        source: p.detected_source?.sourceName ?? 'Direct',
        city: q?.address?.split(',')[0]?.trim() ?? null,
      }
    })

  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return {
    firstName: profile.broker_memory?.fullName?.split(' ')[0] ?? null,
    agencyName: profile.broker_memory?.agencyName ?? null,
    dateLabel,
    newCount,
    hotPendingCount: hotPending.length,
    leads: top,
    appUrl,
  }
}
