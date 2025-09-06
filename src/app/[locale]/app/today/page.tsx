import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import AdviceCard from '@/components/AdviceCard'
import SupplementPrompt from '@/components/SupplementPrompt'
import { getOrGenerateAdvice } from '@/app/(app)/actions/advice'
import ProgramCard from '@/components/ProgramCard'

type Props = {
  params: { locale: string }
  searchParams: { d?: string }
}

// --- Récupération user_id (simple cookie local, à remplacer par Auth Supabase plus tard)
const USER_ID_COOKIE = 'uid'
function getUserId(): string {
  const store: any = cookies();
  const c = store?.get?.(USER_ID_COOKIE);
  const v = typeof c === 'string' ? c : c?.value;
  return v ?? '00000000-0000-0000-0000-000000000000';
}


// Accent cuivre (mêmes valeurs que la charte / modale)
const COPPER = '#C8742E'
const COPPER_SOFT = 'rgba(200,116,46,0.12)'
const COPPER_BORDER = 'rgba(200,116,46,0.55)'

// Phase courante pour le badge « À faire maintenant »
function currentPhase(date = new Date()) {
  const h = date.getHours()
  if (h < 10) return 'wake'
  if (h < 12) return 'breakfast'
  if (h < 16) return 'lunch'
  if (h < 21) return 'dinner'
  return 'evening'
}

// Déduit la position idéale du conseil en lisant son texte
type Slot = 'wake' | 'breakfast' | 'after-lunch' | 'dinner' | 'evening'
function slotForTip(tip: string): Slot {
  const t = tip.toLowerCase()
  const has = (...keys: string[]) => keys.some(k => t.includes(k))

  // Indices horaires explicites
  if (has('matin', 'morning', 'réveil', 'reveil')) return 'wake'
  if (has('petit-déjeuner', 'petit dejeuner', 'breakfast')) return 'breakfast'
  if (has('déjeuner', 'dejeuner', 'lunch')) return 'after-lunch'
  if (has('dîner', 'diner', 'dinner')) return 'dinner'
  if (has('soir', 'evening', 'nuit', 'coucher')) return 'evening'
  if (has('après-midi', 'apres-midi', 'pm', 'après midi', 'apres midi')) return 'after-lunch'

  // Par type
  if (has('hydrat')) return 'after-lunch'
  if (has('box')) return 'after-lunch'
  if (has('cohérence', 'coherence')) return 'wake'

  // Par défaut
  return 'after-lunch'
}

export default async function TodayPage({ params, searchParams }: Props) {
  const { locale } = params
  const { d } = searchParams
  const t = await getTranslations({ locale, namespace: 'today' })

  const dateParam = d
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : new Date().toISOString().slice(0, 10)

  const userId = getUserId()

  // Conseil du jour (déterministe + cache)
  let adviceText = 'Cohérence cardiaque 5-5 (1–2 minutes).'
  try {
    const { tip } = await getOrGenerateAdvice({ user_id: userId, date })
    if (tip) adviceText = tip
  } catch {
    // fallback silencieux
  }

  const adviceSlot = slotForTip(adviceText)
  const phase = currentPhase()

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <div className="text-sm text-gray-600">{date}</div>
      </div>

      {/* Programme du jour avec insertion du conseil */}
      <section className="space-y-4">
        <ProgramCard
          id="wake"
          title="Réveil — Cohérence 5-5"
          summary="Assieds-toi, respire 5s/5s pendant 1–2 minutes pour démarrer au calme."
          isNow={phase === 'wake'}
        />
        {adviceSlot === 'wake' && <AdviceCard tip={adviceText} />}

        <ProgramCard
          id="breakfast"
          title="Petit-déjeuner + REGEN+ (2)"
          summary="Petit-déj adapté + 2 gélules REGEN+."
          isNow={phase === 'breakfast'}
        />
        {adviceSlot === 'breakfast' && <AdviceCard tip={adviceText} />}

        <ProgramCard
          id="lunch"
          title="Déjeuner"
          summary="Repas équilibré, hydratation régulière."
          isNow={phase === 'lunch'}
        />
        {adviceSlot === 'after-lunch' && <AdviceCard tip={adviceText} />}

        <ProgramCard
          id="dinner"
          title="Dîner + REGEN+ (2)"
          summary="Dîner léger si possible + 2 gélules REGEN+."
          isNow={phase === 'dinner'}
        />
        {adviceSlot === 'dinner' && <AdviceCard tip={adviceText} />}

        <ProgramCard
          id="evening"
          title="Soir — 4-7-8 + petites gorgées"
          summary="Respire 4-7-8 (~2 min) ~20 min avant le coucher. Évite de boire 60–90 min avant dodo."
          isNow={phase === 'evening'}
        />
        {adviceSlot === 'evening' && <AdviceCard tip={adviceText} />}
      </section>

      {/* Modale REGEN+ : besoin de userId + date */}
      <SupplementPrompt userId={userId} date={date} />
    </main>
  )
}
