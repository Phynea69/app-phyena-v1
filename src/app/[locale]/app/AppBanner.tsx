import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function AppBanner({
  show,
  locale
}: {
  show: boolean
  locale: string
}) {
  if (!show) return null
  const t = await getTranslations('banner')

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          {t('incomplete')}
        </p>
        <Link
          href={`/${locale}/app/account`}
          className="inline-flex items-center rounded-xl bg-amber-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition"
        >
          {t('complete')}
        </Link>
      </div>
    </div>
  )
}
