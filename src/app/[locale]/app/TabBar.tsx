'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, CalendarCheck2, User2 } from 'lucide-react'

type Props = { locale: string }

export default function TabBar({ locale }: Props) {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const base = `/${locale}/app`
  const items = [
    { href: `${base}/today`,  label: t('today'),   icon: Home },
    { href: `${base}/history`,label: t('history'), icon: CalendarCheck2 },
    { href: `${base}/account`,label: t('account'), icon: User2 },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-[env(safe-area-inset-bottom)] max-w-md px-4 pb-4"
      aria-label="Navigation principale"
    >
      <div className="grid grid-cols-3 gap-2 rounded-3xl border bg-white/90 backdrop-blur-md shadow-lg p-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex flex-col items-center justify-center rounded-2xl py-2 text-xs transition',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
