'use server'

import { createClient } from '@supabase/supabase-js'

type DayType = 'rest' | 'sport_am' | 'sport_pm'
type AMStress = 'calm' | 'normal' | 'tense' | null
type AMSleep  = 'yes'  | 'maybe'  | 'no'    | null

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, anon)
}

// Ordre de recherche user_id :
// 1) env NEXT_PUBLIC_TEST_USER_ID (dev)
// 2) settings.user_id
// 3) profiles.id
async function getAnyUserId() {
  const envId = process.env.NEXT_PUBLIC_TEST_USER_ID
  if (envId) return envId

  const client = sb()
  const { data: s } = await client.from('settings').select('user_id').limit(1).maybeSingle()
  if (s?.user_id) return s.user_id as string

  const { data: p } = await client.from('profiles').select('id').limit(1).maybeSingle()
  if (p?.id) return p.id as string

  throw new Error('Aucun utilisateur trouvé : ajoute un user_id en settings ou profiles (ou définis NEXT_PUBLIC_TEST_USER_ID).')
}

async function getDayType(user_id: string, dateISO: string): Promise<DayType> {
  const client = sb()
  const { data: ov } = await client
    .from('day_overrides')
    .select('day_type')
    .eq('user_id', user_id)
    .eq('date', dateISO)
    .maybeSingle()
  if (ov?.day_type) return ov.day_type as DayType

  const { data: st } = await client
    .from('settings')
    .select('sport_default')
    .eq('user_id', user_id)
    .maybeSingle()
  return (st?.sport_default as DayType) ?? 'rest'
}

export type DayContext = {
  user_id: string
  day_type: DayType
  am_stress: AMStress
  am_sleep: AMSleep
  am_pain_eva: number | null
  wake_time: string | null
  sleep_time: string | null
}

export async function getDayContext(dateISO: string): Promise<DayContext> {
  const client = sb()
  const user_id = await getAnyUserId()
  const day_type = await getDayType(user_id, dateISO)

  const { data: entry } = await client
    .from('daily_entries')
    .select('am_stress, am_sleep, am_pain_eva')
    .eq('user_id', user_id)
    .eq('date', dateISO)
    .maybeSingle()

  const { data: settings } = await client
    .from('settings')
    .select('wake_time, sleep_time')
    .eq('user_id', user_id)
    .maybeSingle()

  return {
    user_id,
    day_type,
    am_stress: (entry?.am_stress as AMStress) ?? null,
    am_sleep: (entry?.am_sleep as AMSleep) ?? null,
    am_pain_eva: entry?.am_pain_eva ?? null,
    wake_time: settings?.wake_time ?? null,
    sleep_time: settings?.sleep_time ?? null,
  }
}
