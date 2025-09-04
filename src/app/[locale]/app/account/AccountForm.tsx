'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

type Props = {
  initial: {
    locale: 'fr' | 'en'
    notifications_opt_in: boolean
    wake_time: string | null
    sleep_time: string | null
  }
}

export default function AccountForm({ initial }: Props) {
  const t = useTranslations('account')
  const tc = useTranslations('common')

  const [locale, setLocale] = useState<'fr'|'en'>(initial.locale)
  const [notifications, setNotifications] = useState(initial.notifications_opt_in)
  const [wake, setWake] = useState(initial.wake_time ?? '')
  const [sleep, setSleep] = useState(initial.sleep_time ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          user_id: user.id,
          locale,
          notifications_opt_in: notifications,
          wake_time: wake || null,
          sleep_time: sleep || null
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )

    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(t('save_success'))
      const parts = window.location.pathname.split('/')
      const currentLocale = parts[1]
      if (currentLocale !== locale) {
        parts[1] = locale
        window.location.href = parts.join('/')
      }
    }
  }

  return (
    <section className="space-y-4 max-w-sm">
      <div className="grid gap-2">
        <label className="text-sm font-medium">{t('language')}</label>
        <select
          className="h-11 rounded-2xl border px-3 bg-transparent"
          value={locale}
          onChange={(e)=>setLocale(e.target.value as 'fr'|'en')}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">{t('notifications')}</label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notifications} onChange={(e)=>setNotifications(e.target.checked)} />
          {t('receive_emails')}
        </label>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">{t('wake')}</label>
        <Input type="time" value={wake} onChange={(e)=>setWake(e.target.value)} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">{t('sleep')}</label>
        <Input type="time" value={sleep} onChange={(e)=>setSleep(e.target.value)} />
      </div>

      <Button disabled={saving} onClick={save} className="rounded-2xl">
        {saving ? tc('saving') : tc('save')}
      </Button>
    </section>
  )
}
