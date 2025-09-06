'use client'

import { useState } from 'react'
import { saveEveningCheckin } from '@/app/(app)/actions/checkins'

export default function EveningSheet({
  dateISO,
  initialOpen,
}: {
  dateISO: string
  initialOpen: boolean
}) {
  const [open, setOpen] = useState(initialOpen)

  if (!open) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md rounded-t-2xl border bg-white p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-sm uppercase opacity-60">Check-in du soir</div>
          <button className="text-sm underline" onClick={() => setOpen(false)}>
            Plus tard
          </button>
        </div>

        <form
          action={async (fd) => {
            await saveEveningCheckin(dateISO, fd)
            setOpen(false)
          }}
          className="mt-3 space-y-3"
        >
          <label className="flex items-center gap-2">
            <input type="checkbox" name="breathing_done" />
            Respiration 4-7-8 effectuée (~2 min)
          </label>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Douleur (0–10)</label>
            <input
              type="range"
              name="evening_pain_eva"
              min={0}
              max={10}
              defaultValue=""
              className="w-full"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-black text-white px-4 py-2 text-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
