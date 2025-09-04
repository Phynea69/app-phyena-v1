'use client'

import { Droplet, Wind, Utensils, Check } from 'lucide-react'

type Entry = {
  date: string // ISO (YYYY-MM-DD)
  hydration: boolean | null
  breathing: boolean | null
  meals: boolean | null
}

export default function HistoryList({
  entries,
  locale
}: {
  entries: Entry[]
  locale: string
}) {
  // index par date pour lookup rapide
  const byDate = new Map(entries.map(e => [e.date, e]))

  // génère les 14 derniers jours (J0 = aujourd'hui)
  const days: string[] = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10) // YYYY-MM-DD
    return iso
  })

  const fmt = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    })

  return (
    <ul className="space-y-3">
      {days.map((iso) => {
        const e = byDate.get(iso)
        const slot = [
          { key: 'hydration', ok: !!e?.hydration, Icon: Droplet, label: 'H' },
          { key: 'breathing', ok: !!e?.breathing, Icon: Wind, label: 'B' },
          { key: 'meals', ok: !!e?.meals, Icon: Utensils, label: 'M' },
        ]
        const done = slot.filter(s => s.ok).length

        return (
          <li
            key={iso}
            className="rounded-2xl border bg-white shadow-sm px-4 py-3 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900">
                {fmt(iso)}
              </p>
              <p className="text-xs text-neutral-500">
                {done}/3
              </p>
            </div>

            <div className="flex items-center gap-2">
              {slot.map(({ key, ok, Icon }) => (
                <span
                  key={key}
                  className={[
                    'inline-flex items-center justify-center h-8 w-8 rounded-xl border',
                    ok
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-500 border-neutral-200'
                  ].join(' ')}
                  title={key}
                >
                  {ok ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
              ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
