'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Props = { date: string }

type EntryRow = {
  id: string
  hydration: boolean | null
  breathing: boolean | null
  meals: boolean | null
}

export default function TodayChecklist({ date }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [entryId, setEntryId] = useState<string | null>(null)
  const [hydration, setHydration] = useState(false)
  const [breathing, setBreathing] = useState(false)
  const [meals, setMeals] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)

      // 1) Récupérer un user_id “dev” (settings -> user_id) sinon TEST_USER_ID
      const { data: s } = await supabase
        .from('settings')
        .select('user_id')
        .limit(1)
        .maybeSingle()

      const fallback = process.env.NEXT_PUBLIC_TEST_USER_ID || null
      const uid = s?.user_id ?? fallback
      setUserId(uid)

      // 2) Charger la ligne du jour si elle existe
      if (uid) {
        const { data } = await supabase
          .from('daily_entries')
          .select('id, hydration, breathing, meals')
          .eq('user_id', uid)
          .eq('date', date)
          .maybeSingle<EntryRow>()

        if (mounted && data) {
          setEntryId(data.id)
          setHydration(!!data.hydration)
          setBreathing(!!data.breathing)
          setMeals(!!data.meals)
        } else {
          if (mounted) {
            setEntryId(null)
            setHydration(false)
            setBreathing(false)
            setMeals(false)
          }
        }
      }

      if (mounted) setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [date])

  async function save() {
    if (!userId) {
      alert(
        "Aucun utilisateur (dev) : assure-toi d'avoir une ligne dans 'settings' ou une variable NEXT_PUBLIC_TEST_USER_ID."
      )
      return
    }
    setSaving(true)

    const payload = {
      user_id: userId,
      date,
      hydration,
      breathing,
      meals,
      updated_at: new Date().toISOString(),
    }

    if (entryId) {
      const { error } = await supabase
        .from('daily_entries')
        .update(payload)
        .eq('id', entryId)

      if (error) {
        console.error(error)
        alert("Erreur pendant l'enregistrement.")
      } else {
        alert('Enregistré ✅')
      }
    } else {
      const { data, error } = await supabase
        .from('daily_entries')
        .insert(payload)
        .select('id')
        .maybeSingle()

      if (error) {
        console.error(error)
        alert("Erreur pendant l'enregistrement.")
      } else {
        setEntryId(data?.id ?? null)
        alert('Enregistré ✅')
      }
    }

    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <ChecklistItem
        label="Hydratation"
        checked={hydration}
        onChange={setHydration}
        disabled={loading || saving}
      />
      <ChecklistItem
        label="Respiration"
        checked={breathing}
        onChange={setBreathing}
        disabled={loading || saving}
      />
      <ChecklistItem
        label="Alimentation"
        checked={meals}
        onChange={setMeals}
        disabled={loading || saving}
      />

      <button
        type="button"
        onClick={save}
        disabled={loading || saving}
        className="w-full rounded-2xl bg-[#0d1420] px-4 py-3 text-white disabled:opacity-60"
      >
        {saving ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  )
}

function ChecklistItem({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border px-4 py-4">
      <span className="text-lg">{label}</span>
      <input
        type="checkbox"
        className="h-6 w-6 accent-black"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
    </label>
  )
}
