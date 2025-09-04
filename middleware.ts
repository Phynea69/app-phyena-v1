// middleware.ts — Next.js + Supabase (auth-helpers) — version stable
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  // Important : créer une réponse pour que le client middleware puisse rafraîchir les cookies si besoin
  const res = NextResponse.next()

  // Crée un client Supabase lié à la requête/réponse du middleware
  const supabase = createMiddlewareClient({ req, res })

  // Rafraîchit la session si nécessaire et la récupère
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  const isAppRoute = path.startsWith('/app')
  const isLoginRoute = path === '/login'

  // 1) Si l'utilisateur n'est pas connecté et essaie d'accéder à /app → redirige vers /login
  if (isAppRoute && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2) Si l'utilisateur est déjà connecté et va sur /login → envoie vers /app/today
  if (isLoginRoute && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/app/today'
    return NextResponse.redirect(url)
  }

  // Sinon on laisse passer
  return res
}

// Le middleware ne s'exécute que sur /app/* et /login (pas sur /auth/callback)
export const config = {
  matcher: ['/app/:path*', '/login'],
}
