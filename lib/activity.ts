// ════════════════════════════════════════════════════════════════════════
//  Activity log par prospect — audit trail chronologique
//
//  Chaque événement est ajouté à la fin du tableau prospects.activity
//  Permet de reconstituer l'historique complet d'un dossier
// ════════════════════════════════════════════════════════════════════════

export type ActivityType =
  | 'email_received'        // Email reçu de Gmail
  | 'qualified'              // Pipeline IA terminée
  | 'filtered'               // Email écarté par le pré-filtre
  | 'viewed'                 // Courtier a ouvert la fiche
  | 'note_added'             // Note interne mise à jour
  | 'bank_added'             // Banque ajoutée au suivi
  | 'bank_status_changed'    // Statut banque modifié
  | 'email_sent'             // Réponse envoyée au prospect
  | 'archived'               // Dossier archivé
  | 'status_changed'         // Changement statut général

export interface Activity {
  type: ActivityType
  at: string                 // ISO timestamp
  label: string              // Texte affiché en timeline
  metadata?: Record<string, unknown>
}

// ── Helpers pour fabriquer chaque type d'événement ────────────────────

export function activityEmailReceived(source: string): Activity {
  return {
    type: 'email_received',
    at: new Date().toISOString(),
    label: source && source !== 'Direct' ? `Email reçu via ${source}` : 'Email reçu',
    metadata: { source },
  }
}

export function activityQualified(score: number, temperature: string): Activity {
  return {
    type: 'qualified',
    at: new Date().toISOString(),
    label: `Qualifié · score ${score}/100 (${temperatureLabel(temperature)})`,
    metadata: { score, temperature },
  }
}

export function activityFiltered(reason: string): Activity {
  return {
    type: 'filtered',
    at: new Date().toISOString(),
    label: `Écarté : ${reason}`,
    metadata: { reason },
  }
}

export function activityViewed(): Activity {
  return {
    type: 'viewed',
    at: new Date().toISOString(),
    label: 'Fiche consultée',
  }
}

export function activityNoteAdded(preview: string): Activity {
  return {
    type: 'note_added',
    at: new Date().toISOString(),
    label: 'Note mise à jour',
    metadata: { preview: preview.slice(0, 100) },
  }
}

export function activityBankAdded(bankName: string): Activity {
  return {
    type: 'bank_added',
    at: new Date().toISOString(),
    label: `Banque ajoutée : ${bankName}`,
    metadata: { bank: bankName },
  }
}

export function activityBankStatusChanged(bankName: string, newStatus: string, rate?: number): Activity {
  const statusLabel = bankStatusLabel(newStatus)
  const rateStr = rate ? ` · taux ${rate}%` : ''
  return {
    type: 'bank_status_changed',
    at: new Date().toISOString(),
    label: `${bankName} → ${statusLabel}${rateStr}`,
    metadata: { bank: bankName, status: newStatus, rate },
  }
}

export function activityEmailSent(): Activity {
  return {
    type: 'email_sent',
    at: new Date().toISOString(),
    label: 'Réponse envoyée au prospect',
  }
}

export function activityArchived(): Activity {
  return {
    type: 'archived',
    at: new Date().toISOString(),
    label: 'Dossier archivé',
  }
}

// ── Labels ──────────────────────────────────────────────────────────

function temperatureLabel(t: string): string {
  if (t === 'hot') return 'Prioritaire'
  if (t === 'warm') return 'À qualifier'
  return 'Non prioritaire'
}

function bankStatusLabel(s: string): string {
  if (s === 'pending')  return 'En attente'
  if (s === 'accepted') return 'Accordé'
  if (s === 'rejected') return 'Refusé'
  if (s === 'counter')  return 'Contre-offre'
  return s
}

// ── Append helper côté client ───────────────────────────────────────

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ajoute un événement au log d'activité d'un prospect
 * (à appeler depuis le navigateur via le client Supabase)
 */
export async function logActivity(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, 'public', any>,
  prospectId: string,
  event: Activity,
): Promise<void> {
  // Lire l'existant, ajouter, réécrire (pas de jsonb_append côté client)
  const { data } = await supabase
    .from('prospects')
    .select('activity')
    .eq('id', prospectId)
    .single()

  const current = (data?.activity ?? []) as Activity[]
  const next = [...current, event].slice(-100)  // Cap à 100 événements

  await supabase
    .from('prospects')
    .update({ activity: next })
    .eq('id', prospectId)
}
