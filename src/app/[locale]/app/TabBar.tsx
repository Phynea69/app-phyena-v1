'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Home, CalendarDays, Ellipsis } from 'lucide-react'

export default function TabBar() {
  const { locale } = useParams<{ locale: string }>()
  const pathname = usePathname()
  const base = `/${locale}/app`

  const items = [
    { href: `${base}/today`, label: `Aujourd’hui`, icon: <Home size={20} /> },
    { href: `${base}/program`, label: 'Programme', icon: <CalendarDays size={20} /> },
    // provisoire : "Plus" pointe vers Compte (tu pourras changer plus tard)
    { href: `${base}/account`, label: 'Plus', icon: <Ellipsis size={20} /> },
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <ul className="flex gap-3 rounded-2xl border bg-white/95 backdrop-blur px-3 py-2 shadow">
        {items.map((it) => {
          const active = pathname?.startsWith(it.href)
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`flex flex-col items-center min-w-[96px] px-4 py-2 rounded-xl ${
                  active ? 'bg-black text-white' : 'text-black'
                }`}
              >
                {it.icon}
                <span className="text-xs mt-1">{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
