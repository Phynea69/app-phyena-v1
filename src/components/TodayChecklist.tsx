'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

type Props = {
  date: string // format YYYY-MM-DD (passé par la page)
}

export default function TodayChecklist({ date }: Props) {
  const t = useTranslations('today')
  const tc = useTranslations('common')

  const [hydration, setHydration] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [meals, setMeals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Charger l'état du jour
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_entries')
        .select('hydration,breathing,meals')
        .eq('date', date)
        .limit(1)
        .maybeSingle()

      if (alive) {
        if (!error && data) {
          setHydration(!!data.hydration)
          setBreathing(!!data.breathing)
          setMeals(!!data.meals)
        }
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [date])

  async function save() {
    try {
      setSaving(true)

      // On n'envoie PAS user_id : la trigger DB le pose = auth.uid()
      const row = { date, hydration, breathing, meals }

      const { error } = await supabase
        .from('daily_entries')
        .upsert(row, { onConflict: 'user_id,date' }) // unique index

      if (error) throw error
      toast.success(t('save_ok'))
    } catch (err: any) {
      toast.error(err?.message ?? 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      {/* Hydratation */}
      <label className="rounded-2xl p-4 border flex items-center justify-between">
        <span className="text-base">{t('hydration')}</span>
        <Checkbox
          checked={hydration}
          onCheckedChange={(v) => setHydration(Boolean(v))}
        />
      </label>

      {/* Respiration */}
      <label className="rounded-2xl p-4 border flex items-center justify-between">
        <span className="text-base">{t('breathing')}</span>
        <Checkbox
          checked={breathing}
          onCheckedChange={(v) => setBreathing(Boolean(v))}
        />
      </label>

      {/* Alimentation */}
      <label className="rounded-2xl p-4 border flex items-center justify-between">
        <span className="text-base">{t('meals')}</span>
        <Checkbox
          checked={meals}
          onCheckedChange={(v) => setMeals(Boolean(v))}
        />
      </label>

      <Button
        onClick={save}
        disabled={saving || loading}
        className="rounded-2xl w-full"
      >
        {saving ? tc('saving') : tc('save')}
      </Button>
    </section>
  )
}
