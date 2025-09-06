'use client'

import { useState, ReactNode } from 'react'

type Props = {
  id: string
  title: string
  summary: string
  isNow?: boolean
  children?: ReactNode   // contenu détaillé (facultatif)
}

const COPPER = '#C8742E'
const COPPER_SOFT = 'rgba(200,116,46,0.12)'
const COPPER_BORDER = 'rgba(200,116,46,0.55)'

export default function ProgramCard({ id, title, summary, isNow, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <section
      id={id}
      className="rounded-2xl border overflow-hidden"
      style={
        isNow
          ? { borderColor: COPPER_BORDER, background: COPPER_SOFT, boxShadow: `0 0 0 1px ${COPPER_BORDER}` }
          : undefined
      }
    >
      {/* l’entête entière est cliquable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="grow">
          <h3 className="font-medium">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed">{summary}</p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {isNow && (
            <span
              className="rounded-full px-3 py-1 text-xs"
              style={{ color: COPPER, border: `1px solid ${COPPER_BORDER}`, background: '#fff' }}
            >
              À faire maintenant
            </span>
          )}
          <span
            aria-hidden
            className={`inline-block transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
          >
            ▾
          </span>
        </div>
      </button>

      {open && children && (
        <div className="px-4 pb-4 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </section>
  )
}
