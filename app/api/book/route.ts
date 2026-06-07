import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

interface BookingPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  agencyName: string
  preferredSlot: string
  city?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit : 5 réservations / IP / 10 minutes
    const ip = getClientIp(request.headers)
    const limit = rateLimit(`book:${ip}`, 5, 10 * 60_000)
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Trop de réservations — réessayez plus tard.' },
        { status: 429, headers: { 'Retry-After': '600' } },
      )
    }

    const body = await request.json() as BookingPayload

    // Validation minimale
    if (!body.email || !body.firstName || !body.agencyName) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Tentative de sauvegarde Supabase (silencieux si échec)
    try {
      const supabase = createAdminClient()
      await supabase.from('demo_bookings').insert({
        first_name:     body.firstName,
        last_name:      body.lastName,
        email:          body.email,
        phone:          body.phone,
        agency_name:    body.agencyName,
        city:           body.city ?? null,
        preferred_slot: body.preferredSlot,
        message:        body.message ?? null,
      })
    } catch (e) {
      // Si la table n'existe pas, on log juste (ne bloque pas l'utilisateur)
      console.error('demo_bookings insert failed:', e)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}
