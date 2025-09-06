'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

type DayType = 'rest' | 'sport_am' | 'sport_pm'

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon)
}

async function getUserId() {
  const envId = process.env.NEXT_PUBLIC_TEST_USER_ID
  if (envId) return envId
  const client = sb()
  const { data: s } = await client.from('settings').select('user_id').limit(1).maybeSingle()
  if (s?.user_id) return s.user_id as string
  const { data: p } = await client.from('profiles').select('id').limit(1).maybeSingle()
  if (p?.id) return p.id as string
  throw new Error('Aucun utilisateur')
}

export async function getProgramRange(centerISO: string, daysBack = 15, daysForward = 15) {
  const client = sb()
  const user_id = await getUserId()

  const center = new Date(centerISO + 'T00:00:00')
  const from = new Date(center)
  from.setDate(center.getDate() - daysBack)
  const to = new Date(center)
  to.setDate(center.getDate() + daysForward)

  const fromISO = from.toISOString().slice(0, 10)
  const toISO = to.toISOString().slice(0, 10)
  const todayISO = new Date().toISOString().slice(0, 10)

  const { data: entries } = await client
    .from('daily_entries')
    .select('date, hydration_done, breathing_done, meals_done')
    .eq('user_id', user_id)
    .gte('date', fromISO)
    .lte('date', toISO)

  const { data: overrides } = await client
    .from('day_overrides')
    .select('date, day_type')
    .eq('user_id', user_id)
    .gte('date', fromISO)
    .lte('date', toISO)

  const { data: settings } = await client
    .from('settings')
    .select('sport_default')
    .eq('user_id', user_id)
    .maybeSingle()

  const eByDate = new Map<string, any>()
  for (const e of entries ?? []) eByDate.set(e.date, e)

  const ovByDate = new Map<string, any>()
  for (const o of overrides ?? []) ovByDate.set(o.date, o)

  const out: Array<{
    date: string
    hydration_done?: boolean
    breathing_done?: boolean
    meals_done?: boolean
    day_type: DayType
    isFuture: boolean
    isToday: boolean
  }> = []

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10)
    const e = eByDate.get(iso)
    const ov = ovByDate.get(iso)
    const day_type: DayType =
      (ov?.day_type as DayType) ?? (settings?.sport_default as DayType) ?? 'rest'
    const isFuture = iso > todayISO
    const isToday = iso === todayISO
    out.push({
      date: iso,
      hydration_done: e?.hydration_done ?? false,
      breathing_done: e?.breathing_done ?? false,
      meals_done: e?.meals_done ?? false,
      day_type,
      isFuture,
      isToday,
    })
  }

  return out
}

export async function setDayType(dateISO: string, day_type: DayType | 'default') {
  const client = sb()
  const user_id = await getUserId()

  if (day_type === 'default') {
    await client.from('day_overrides').delete().eq('user_id', user_id).eq('date', dateISO)
  } else {
    await client
      .from('day_overrides')
      .upsert({ user_id, date: dateISO, day_type }, { onConflict: 'user_id, date' })
  }

  revalidatePath('/[locale]/app/program', 'page')
  revalidatePath('/[locale]/app/today', 'page')
}
