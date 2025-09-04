import { createServerSupabase } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import AccountForm from './AccountForm'

export default async function AccountPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings } = await supabase
    .from('settings')
    .select('locale, notifications_opt_in, wake_time, sleep_time')
    .eq('user_id', user.id)
    .maybeSingle()

  const t = await getTranslations('account')

  return (
    <main className="min-h-screen space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">
        {t('title')}
      </h1>
      <AccountForm
        initial={{
          locale: (settings?.locale as 'fr' | 'en') ?? 'fr',
          notifications_opt_in: settings?.notifications_opt_in ?? false,
          wake_time: settings?.wake_time ?? null,
          sleep_time: settings?.sleep_time ?? null
        }}
      />
    </main>
  )
}
