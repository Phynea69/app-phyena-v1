'use client'

import { useState } from 'react'
import { saveMorningCheckin } from '@/app/(app)/actions/checkins'

export default function MorningSheet({
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
          <div className="text-sm uppercase opacity-60">Check-in du matin</div>
          <button className="text-sm underline" onClick={() => setOpen(false)}>
            Plus tard
          </button>
        </div>

        <form
          action={async (fd) => {
            await saveMorningCheckin(dateISO, fd)
            setOpen(false)
          }}
          className="mt-3 space-y-3"
        >
          <div className="space-y-1">
            <label className="block text-sm font-medium">Stress</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_stress" value="calm" /> Calme
              </label>
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_stress" value="normal" /> Normal
              </label>
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_stress" value="tense" /> Tendu
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Qualité du sommeil</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_sleep" value="yes" /> Réparateur
              </label>
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_sleep" value="maybe" /> Moyen
              </label>
              <label className="flex items-center gap-2 border rounded-full px-3 py-1">
                <input type="radio" name="am_sleep" value="no" /> Mauvais
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium">Douleur (0–10)</label>
            <input
              type="range"
              name="am_pain_eva"
              min={0}
              max={10}
              defaultValue={0}
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
