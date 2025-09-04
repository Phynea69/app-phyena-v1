import type { ReactNode } from 'react'
import TabBar from './TabBar'
import AppBanner from './AppBanner'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Vérifie si le compte est "complet"
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  let showBanner = false
  if (user) {
    const { data: s } = await supabase
      .from('settings')
      .select('wake_time, sleep_time, locale')
      .eq('user_id', user.id)
      .maybeSingle()

    showBanner = !s || !s.wake_time || !s.sleep_time || !s.locale
  }

  return (
    <div className="mx-auto max-w-md min-h-screen bg-white text-neutral-900 antialiased">
      <div className="px-4 pb-28 pt-4">
        {/* Bannière onboarding si nécessaire */}
        <AppBanner show={showBanner} locale={locale} />

        {children}
      </div>
      <TabBar locale={locale} />
    </div>
  )
}
