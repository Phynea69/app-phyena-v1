import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

// On évite le cache sur cette route d'auth
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Next.js 15 : cookies() doit être awaited en route handler
  // (si VS Code affiche un warning de typage, on l'ignore — c'est le bon usage)
  // @ts-expect-error Next 15 async cookies()
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email ?? null },
        { onConflict: 'id', ignoreDuplicates: true }
      )

    await supabase
      .from('settings')
      .upsert(
        { user_id: user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )
  }

  // Première arrivée -> page Compte
  return NextResponse.redirect(new URL('/fr/app/account', req.url))
}
