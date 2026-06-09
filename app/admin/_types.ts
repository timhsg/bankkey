// Types partagés entre la page admin et ses composants
export interface CabinetRow {
  id: string
  email: string
  agencyName: string | null
  fullName: string | null
  createdAt: string
  plan: string
  status: string
  trialEndsAt: string | null
  currentPeriodEnd: string | null
  gmailEmail: string | null
  lastSync: string | null
  forwardingAddress: string | null
  prospectCount: number
  last30Days: number
  hotCount: number
  outcomeCount: number
  acceptedCount: number
  isAdmin: boolean
}
