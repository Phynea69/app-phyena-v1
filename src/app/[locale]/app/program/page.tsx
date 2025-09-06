import Link from 'next/link'
import AutoCenter from '@/components/AutoCenter'
import { getProgramRange, setDayType } from '@/app/(app)/actions/program'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ d?: string }>
}

export default async function ProgramPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { d } = await searchParams

  // Date à centrer (aujourd'hui par défaut)
  const center = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10)

  // Fenêtre : 15 jours avant / 15 jours après
  const items = await getProgramRange(center, 15, 15)

  return (
    <main className="max-w-md mx-auto p-4 text-black">
      <h1 className="text-3xl font-semibold mb-4">Programme</h1>

      {/* Auto-centrer la liste sur la carte du jour */}
      <AutoCenter targetId="today" />

      <div className="space-y-3">
        {items.map((item) => (
          <DayRow key={item.date} item={item} locale={locale} />
        ))}
      </div>
    </main>
  )
}

function DayRow({
  item,
  locale,
}: {
  item: Awaited<ReturnType<typeof getProgramRange>>[number]
  locale: string
}) {
  const date = new Date(item.date + 'T00:00:00')
  const label = date.toLocaleDateString(locale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

  // Couleurs cuivre Phynea (soft + bordure)
  const copperBg = 'rgba(184,115,51,0.08)'
  const copperBorder = 'rgba(184,115,51,0.4)'

  return (
    <section
      id={item.isToday ? 'today' : undefined}
      className="rounded-2xl border p-3"
      style={item.isToday ? { backgroundColor: copperBg, borderColor: copperBorder } : undefined}
    >
      {/* Ligne du haut : date + badges */}
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium">{label}</div>
        <div className="flex items-center gap-2 text-sm">
          <Badge ok={item.hydration_done} title="Hydratation" />
          <Badge ok={item.meals_done} title="Alimentation" />
          <Badge ok={item.breathing_done} title="Respiration" />
        </div>
      </div>

      {/* Ligne du bas : type de jour + bouton Ouvrir */}
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="text-sm opacity-80">
          {item.day_type === 'rest'
            ? 'Repos'
            : item.day_type === 'sport_am'
            ? 'Sport matin'
            : 'Sport après-midi'}
        </div>

        <div className="flex items-center gap-2">
          {/* 👉 redirection vers la page détail /program/[date] */}
          <Link
            href={`/${locale}/app/program/${item.date}`}
            className="rounded-full border px-3 py-1 text-sm"
          >
            Ouvrir
          </Link>
        </div>
      </div>

      {/* Changement de type pour un jour FUTUR uniquement */}
      {item.isFuture && (
        <form action={setDayTypeAction.bind(null, item.date)} className="mt-2 flex gap-1">
          <select
            name="day_type"
            defaultValue={item.day_type}
            className="rounded-full border px-2 py-1 text-sm"
          >
            <option value="rest">Repos</option>
            <option value="sport_am">Sport matin</option>
            <option value="sport_pm">Sport après-midi</option>
            <option value="default">Par défaut</option>
          </select>
          <button className="rounded-full border px-3 py-1 text-sm" type="submit">
            OK
          </button>
        </form>
      )}
    </section>
  )
}

function Badge({ ok, title }: { ok?: boolean; title: string }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ' +
        (ok ? 'opacity-100' : 'opacity-40')
      }
    >
      {title}
    </span>
  )
}

async function setDayTypeAction(dateISO: string, formData: FormData) {
  'use server'
  const val = String(formData.get('day_type') || 'default')
  if (val !== 'rest' && val !== 'sport_am' && val !== 'sport_pm' && val !== 'default') return
  await setDayType(dateISO, val as any)
}
