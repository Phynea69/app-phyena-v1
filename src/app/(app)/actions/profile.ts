'use server';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supa = createClient(URL, SERVICE, { auth: { persistSession: false } });

export async function ensureProfile(params: { user_id: string; locale: string }) {
  const { user_id, locale } = params;
  // profiles(id, email, display_name, locale, created_at)
  await supa.from('profiles').upsert({ id: user_id, locale });
  // settings(user_id, locale, wake_time, sleep_time, updated_at)
  await supa.from('settings').upsert({ user_id, locale });
}
