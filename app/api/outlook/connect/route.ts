import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOutlookAuthUrl, outlookConfigured } from '@/lib/outlook'

/** Démarre le flux OAuth Outlook — redirige vers Microsoft */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/pro/login', request.url))
  }

  // Compte démo partagé : interdit
  if (user.email === 'demo@bankkey.ch') {
    return NextResponse.redirect(new URL('/pro/sources?error=demo_account', request.url))
  }

  // Azure pas encore configuré → bascule sur le transfert email universel
  if (!outlookConfigured()) {
    return NextResponse.redirect(new URL('/pro/sources?error=outlook_not_configured', request.url))
  }

  return NextResponse.redirect(getOutlookAuthUrl(user.id))
}
