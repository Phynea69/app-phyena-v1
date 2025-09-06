import { getTranslations } from 'next-intl/server'
import AdviceCard from '@/components/AdviceCard'
import { getOrGenerateAdvice } from '@/app/(app)/actions/advice'

type Props = {
  params: Promise<{ locale: string; date: string }>
}

const COPPER = '#C8742E'
const COPPER_SOFT = 'rgba(200,116,46,0.12)'
const COPPER_BORDER = 'rgba(200,116,46,0.55)'

function isTodayISO(iso: string) {
  const today = new Date().toISOString().slice(0, 10)
  return iso === today
}

function currentPhase(date = new Date()) {
  const h = date.getHours()
  if (h < 10) return 'wake'
  if (h < 12) return 'breakfast'
  if (h < 16) return 'lunch'
  if (h < 21) return 'dinner'
  return 'evening'
}

type Slot = 'wake'|'breakfast'|'after-lunch'|'dinner'|'evening'
function slotForTip(tip: string): Slot {
  const t = tip.toLowerCase()
  const has = (...keys: string[]) => keys.some(k => t.includes(k))
  if (has('matin','morning','réveil','reveil')) return 'wake'
  if (has('déjeuner','dejeuner','lunch')) return 'breakfast'
  if (has('dîner','diner','dinner')) return 'dinner'
  if (has('soir','evening','nuit','coucher')) return 'evening'
  if (has('après-midi','apres-midi','pm','après midi','apres midi')) return 'after-lunch'
  if (has('hydrat')) return 'after-lunch'
  if (has('box')) return 'after-lunch'
  if (has('cohérence','coherence')) return 'wake'
  return 'after-lunch'
}

export default async function ProgramDayPage({ params }: Props) {
  const { locale, date } = await params
  const t = await getTranslations({ locale, namespace: 'today' })

  // Conseil du jour pour cette date
  let adviceText = 'Cohérence cardiaque 5-5 (1–2 minutes).'
  try {
    const advice = await getOrGenerateAdvice(date)
    if (advice?.tip) adviceText = advice.tip
  } catch {}

  const blocks = [
    { id: 'wake', title: 'Réveil — Cohérence 5-5',
      body: "Assieds-toi, respire 5s/5s pendant 1–2 minutes pour démarrer au calme." },
    { id: 'breakfast', title: 'Petit-déjeuner + REGEN+ (2)',
      body: 'Petit-déj adapté + 2 gélules REGEN+.' },
    { id: 'lunch', title: 'Déjeuner',
      body: 'Repas équilibré, hydratation régulière.' },
    { id: 'dinner', title: 'Dîner + REGEN+ (2)',
      body: 'Dîner léger si possible + 2 gélules REGEN+.' },
    { id: 'evening', title: 'Soir — 4-7-8 + petites gorgées',
      body: "Respire 4-7-8 (~2 min) ~20 min avant le coucher. Évite de boire 60–90 min avant dodo." },
  ] as const

  const adviceSlot = slotForTip(adviceText)
  const highlight = isTodayISO(date) ? currentPhase() : null

  const renderBlock = (id: string, title: string, body: string) => (
    <article
      key={id}
      className="rounded-2xl border p-4"
      style={
        highlight === id
          ? { borderColor: COPPER_BORDER, background: COPPER_SOFT, boxShadow: `0 0 0 1px ${COPPER_BORDER}` }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium">{title}</h3>
        {highlight === id && (
          <span className="shrink-0 rounded-full px-3 py-1 text-xs"
                style={{ color: COPPER, border: `1px solid ${COPPER_BORDER}`, background: '#fff' }}>
            À faire maintenant
          </span>
        )}
      </div>
      <p className="mt-2 text-[15px] leading-relaxed">{body}</p>
    </article>
  )

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <div className="text-sm text-gray-600">{date}</div>
      </div>

      {/* Programme + insertion du conseil au bon endroit */}
      <section className="space-y-4">
        {renderBlock('wake', 'Réveil — Cohérence 5-5',
          "Assieds-toi, respire 5s/5s pendant 1–2 minutes pour démarrer au calme.")}
        {adviceSlot === 'wake' && <AdviceCard tip={adviceText} />}

        {renderBlock('breakfast', 'Petit-déjeuner + REGEN+ (2)', 'Petit-déj adapté + 2 gélules REGEN+.')}
        {adviceSlot === 'breakfast' && <AdviceCard tip={adviceText} />}

        {renderBlock('lunch', 'Déjeuner', 'Repas équilibré, hydratation régulière.')}
        {adviceSlot === 'after-lunch' && <AdviceCard tip={adviceText} />}

        {renderBlock('dinner', 'Dîner + REGEN+ (2)', 'Dîner léger si possible + 2 gélules REGEN+.')}
        {adviceSlot === 'dinner' && <AdviceCard tip={adviceText} />}

        {renderBlock('evening', 'Soir — 4-7-8 + petites gorgées',
          "Respire 4-7-8 (~2 min) ~20 min avant le coucher. Évite de boire 60–90 min avant dodo.")}
        {adviceSlot === 'evening' && <AdviceCard tip={adviceText} />}
      </section>
    </main>
  )
}
