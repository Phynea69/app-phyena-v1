'use server';

import { createClient } from '@supabase/supabase-js';

// ——— Types
type DayType = 'rest' | 'sport_am' | 'sport_pm';
type AMStress = 'calm' | 'normal' | 'tense' | null | undefined;
type AMSleep  = 'yes'  | 'maybe'  | 'no'    | null | undefined;

type Advice = { tip: string; model: 'rules-v3'; slot?: 'morning' | 'pm' };

// ——— Supabase (service role côté serveur uniquement)
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supa = createClient(URL, SERVICE);

// ——— Helpers (lecture DB sûre)
async function getDayType(user_id: string, dateISO: string): Promise<DayType> {
  // 1) override explicite si présent
  const { data: ov } = await supa
    .from('day_overrides')
    .select('day_type')
    .eq('user_id', user_id)
    .eq('date', dateISO)
    .maybeSingle();

  if (ov?.day_type === 'sport_am' || ov?.day_type === 'sport_pm' || ov?.day_type === 'rest') {
    return ov.day_type;
  }

  // 2) défaut simple V1 : repos (on pourra plus tard dériver de settings.sport_default)
  return 'rest';
}

async function getAMInputs(user_id: string, dateISO: string): Promise<{ am_stress: AMStress; am_sleep: AMSleep }> {
  // On lit toute la ligne pour éviter une erreur si les colonnes n'existent pas encore
  const { data } = await supa
    .from('daily_entries')
    .select('*')
    .eq('user_id', user_id)
    .eq('date', dateISO)
    .maybeSingle();

  // Si ces champs n'existent pas, ils seront "undefined"
  const am_stress = (data as any)?.am_stress as AMStress;
  const am_sleep  = (data as any)?.am_sleep as AMSleep;
  return { am_stress, am_sleep };
}

// ——— Logique déterministe V1 (SCIENCE-AI V3, simplifiée)
function computeAdviceV1(day_type: DayType, am_stress: AMStress, am_sleep: AMSleep): Advice {
  // Jours sport → rappel hydratation discret (pas de saisie)
  if (day_type === 'sport_am' || day_type === 'sport_pm') {
    return { tip: 'Hydratation 200–300 ml en après-midi.', model: 'rules-v3', slot: 'pm' };
  }
  // Jour repos → stress tendu ou sommeil “peut-être/non” → box ; sinon cohérence 5-5
  if (am_stress === 'tense' || am_sleep === 'maybe' || am_sleep === 'no') {
    return { tip: 'Respiration “Box” 4-4-4-4 (~2 min).', model: 'rules-v3', slot: 'morning' };
  }
  return { tip: 'Cohérence 5-5 (1–2 min).', model: 'rules-v3', slot: 'morning' };
}

// ——— API principale (server action)
// Compatibilité : accepte soit (params:{user_id,date}), soit (dateISO, user_id?)
export async function getOrGenerateAdvice(
  paramsOrDate:
    | { user_id: string; date: string }
    | string,
  maybeUserId?: string
): Promise<{ tip: string; model: 'rules-v3' }> {

  const dateISO = typeof paramsOrDate === 'string' ? paramsOrDate : paramsOrDate.date;
  const user_id = typeof paramsOrDate === 'string' ? (maybeUserId as string) : paramsOrDate.user_id;

  if (!dateISO) throw new Error('date manquante');
  if (!user_id) throw new Error('user_id manquant');

  // 1) Cache
  const { data: cached, error: cacheErr } = await supa
    .from('ai_tips')
    .select('tip, model')
    .eq('user_id', user_id)
    .eq('date', dateISO)
    .maybeSingle();
  if (cacheErr) {
    // on continue sans casser l’UX
    console.error('[advice] cache read error', cacheErr);
  }
  if (cached?.tip) {
    return { tip: cached.tip as string, model: (cached.model as 'rules-v3') ?? 'rules-v3' };
  }

  // 2) Calcul déterministe V1
  const day_type = await getDayType(user_id, dateISO);
  const { am_stress, am_sleep } = await getAMInputs(user_id, dateISO);
  const { tip, model } = computeAdviceV1(day_type, am_stress, am_sleep);

  // 3) Upsert cache
  const { error: upErr } = await supa
    .from('ai_tips')
    .upsert({ user_id, date: dateISO, tip, model }, { onConflict: 'user_id, date' });
  if (upErr) {
    // ne bloque pas l’affichage du conseil
    console.error('[advice] upsert error', upErr);
  }

  return { tip, model };
}

// (optionnel) export par défaut pour compat signature ancienne
export default getOrGenerateAdvice;
