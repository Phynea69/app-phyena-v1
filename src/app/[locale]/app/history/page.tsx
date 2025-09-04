import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

type Props = { params: { locale: string } }

function formatDate(d: Date, locale: string) {
  return d.toLocaleDateString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  })
}

export default async function HistoryPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  // ✅ on "await" params pour enlever le warning Next 15
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'history' })

  // 15 jours passés
  const days: { key: string; label: string }[] = []
  const today = new Date()
  for (let i = 0; i < 15; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ key, label: formatDate(d, locale) })
  }

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <h1 className="text-3xl font-semibold mb-6">{t('title')}</h1>

      <div className="space-y-3">
        {days.map((d) => (
          <div
            key={d.key}
            className="rounded-2xl border p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{d.label}</div>
              <div className="text-xs text-gray-500">0/3</div>
            </div>
            {/* Icônes grisées (placeholder visuel) */}
            <div className="flex gap-2">
              <div className="h-9 w-9 rounded-full border flex items-center justify-center text-gray-400">💧</div>
              <div className="h-9 w-9 rounded-full border flex items-center justify-center text-gray-400">🌬️</div>
              <div className="h-9 w-9 rounded-full border flex items-center justify-center text-gray-400">🍽️</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href={`/${locale}/app/today`}
          className="inline-block rounded border px-4 py-2"
        >
          {t('back_to_today', { default: '← Retour à aujourd’hui' })}
        </Link>
      </div>
    </main>
  )
}
