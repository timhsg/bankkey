import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuthUrl } from '@/lib/gmail'

/** Démarre le flux OAuth Gmail — redirige vers Google */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/pro/login', request.url))
  }

  const url = getOAuthUrl(user.id)
  return NextResponse.redirect(url)
}
