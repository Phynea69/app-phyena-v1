'use client'

import {useTranslations, useLocale} from 'next-intl'
import Link from 'next/link'

export default function Home() {
  // namespace "home" (cf. messages/*.json)
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      <div className="p-4 rounded-xl bg-sky-100">Tailwind v4 OK</div>

      {/* Conserve la locale active */}
      <Link
        href={`/${locale}/app/today`}
        className="inline-block bg-sky-600 text-white px-4 py-2 rounded-lg"
      >
        {t('cta.start')}
      </Link>
    </main>
  )
}
