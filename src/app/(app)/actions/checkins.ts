'use server';

import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!; // ⚠️ server-only
const supa = createClient(URL, SERVICE, { auth: { persistSession: false } });

type Slot = 'am' | 'pm';

/**
 * Lire l'état actuel (true/false/null) depuis daily_entries.checklist
 */
export async function getSupplementState(params: { user_id: string; date: string; slot: Slot }) {
  const { user_id, date, slot } = params;

  const { data } = await supa
    .from('daily_entries')
    .select('checklist')
    .eq('user_id', user_id)
    .eq('date', date)
    .maybeSingle();

  const v =
    slot === 'am'
      ? (data?.checklist as any)?.supplement_am === true
      : (data?.checklist as any)?.supplement_pm === true;

  return { value: v ?? null as boolean | null };
}

/**
 * Écrire l'état (true/false) dans daily_entries.checklist (merge JSON)
 */
export async function markSupplement(params: { user_id: string; date: string; slot: Slot; value: boolean }) {
  const { user_id, date, slot, value } = params;

  // Lire l'existant pour merger proprement
  const { data } = await supa
    .from('daily_entries')
    .select('checklist')
    .eq('user_id', user_id)
    .eq('date', date)
    .maybeSingle();

  const current = (data?.checklist ?? {}) as Record<string, unknown>;
  const field = slot === 'am' ? 'supplement_am' : 'supplement_pm';
  const checklist = { ...current, [field]: value };

  await supa.from('daily_entries').upsert({ user_id, date, checklist });
}
