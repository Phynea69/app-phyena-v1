import {getTranslations} from 'next-intl/server'
import TodayChecklist from '@/components/TodayChecklist'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ d?: string }>
}

export default async function TodayPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { d } = await searchParams

  const t = await getTranslations({ locale, namespace: 'today' })

  const dateParam = d
  const date =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : new Date().toISOString().slice(0, 10)

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <div className="text-sm text-gray-600">{date}</div>
      </div>

      <TodayChecklist date={date} />
    </main>
  )
}
