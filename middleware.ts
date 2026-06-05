import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path      = request.nextUrl.pathname
  const isLogin   = path === '/pro/login'
  const isPro     = path.startsWith('/pro')

  // Redirige vers login si non authentifié sur une route pro
  if (isPro && !isLogin && !user) {
    return NextResponse.redirect(new URL('/pro/login', request.url))
  }

  // Redirige vers dashboard si déjà connecté et sur la page login
  if (isLogin && user) {
    return NextResponse.redirect(new URL('/pro', request.url))
  }

  return response
}

export const config = {
  matcher: ['/pro/:path*'],
}
