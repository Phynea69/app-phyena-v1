'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

type Props = { date: string }

export default function TodayChecklist({ date }: Props) {
  const t = useTranslations('today')
  const tc = useTranslations('common')

  const [hydration, setHydration] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [meals, setMeals] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Charge l'état du jour (si déjà enregistré)
  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_entries')
        .select('hydration,breathing,meals')
        .eq('date', date)
        .maybeSingle()

      if (alive) {
        if (!error && data) {
          setHydration(Boolean(data.hydration))
          setBreathing(Boolean(data.breathing))
          setMeals(Boolean(data.meals))
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
      // La trigger DB mettra user_id = auth.uid(), on n’envoie pas user_id
      const row = { date, hydration, breathing, meals }

      const { error } = await supabase
        .from('daily_entries')
        .upsert(row, { onConflict: 'user_id,date' })

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
        <input
          type="checkbox"
          className="h-5 w-5 accent-black"
          checked={hydration}
          onChange={(e) => setHydration(e.target.checked)}
          disabled={loading}
        />
      </label>

      {/* Respiration */}
      <label className="rounded-2xl p-4 border flex items-center justify-between">
        <span className="text-base">{t('breathing')}</span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-black"
          checked={breathing}
          onChange={(e) => setBreathing(e.target.checked)}
          disabled={loading}
        />
      </label>

      {/* Alimentation */}
      <label className="rounded-2xl p-4 border flex items-center justify-between">
        <span className="text-base">{t('meals')}</span>
        <input
          type="checkbox"
          className="h-5 w-5 accent-black"
          checked={meals}
          onChange={(e) => setMeals(e.target.checked)}
          disabled={loading}
        />
      </label>

      <button
        onClick={save}
        disabled={saving || loading}
        className="rounded-2xl w-full bg-[#0F172A] text-white py-3 disabled:opacity-60"
      >
        {saving ? tc('saving') : tc('save')}
      </button>
    </section>
  )
}
