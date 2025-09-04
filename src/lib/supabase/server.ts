import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const createServerSupabase = async () => {
  const cookieStore = await cookies() // Next 15: cookies() doit être await
  return createServerComponentClient({ cookies: () => cookieStore })
}
