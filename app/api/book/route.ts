import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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
