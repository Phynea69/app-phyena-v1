'use client'

import { useState } from 'react'

type TipKind = 'hydration' | 'box' | 'coherence'

export default function AdviceCard({ tip }: { tip?: string }) {
  const [open, setOpen] = useState(false)

  // Sécurise le texte (évite toLowerCase sur undefined)
  const safeTip = (typeof tip === 'string' && tip.trim().length > 0)
    ? tip
    : 'Cohérence cardiaque 5-5 (1–2 minutes).'

  const type = inferType(safeTip)
  const details = getDetails(type)

  return (
    <section className="mt-4 mb-6 rounded-2xl border p-0 overflow-hidden">
      {/* ENTÊTE — toute la zone est cliquable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full text-left flex items-start justify-between gap-3 p-4"
      >
        <div className="grow">
          <div className="text-xs font-medium tracking-wide uppercase opacity-60">
            Conseil du jour
          </div>
          <div className="mt-1 text-base leading-relaxed">
            {safeTip}
          </div>
        </div>

        {/* chevron qui pivote */}
        <span
          aria-hidden
          className={`shrink-0 mt-1 inline-block transition-transform ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▾
        </span>
      </button>

      {/* DÉTAILS */}
      {open && (
        <div className="px-4 pb-4 text-sm leading-relaxed space-y-2">
          <p className="opacity-80">{details.why}</p>
          <div>
            <div className="font-medium mb-1">Comment</div>
            <ul className="list-disc pl-5 space-y-1">
              {details.how.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          </div>
          <p><span className="font-medium">Durée&nbsp;:</span> {details.duration}</p>
          {details.care && (
            <p className="text-xs opacity-70">
              <span className="font-medium">Prudence&nbsp;:</span> {details.care}
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function inferType(tip: string): TipKind {
  const t = tip.toLowerCase()
  if (t.includes('hydrat')) return 'hydration'
  if (t.includes('box')) return 'box'
  return 'coherence'
}

function getDetails(type: TipKind) {
  switch (type) {
    case 'hydration':
      return {
        why: "Apporter 200–300 ml pour soutenir l'effort et limiter la déshydratation.",
        how: [
          'Prépare un verre/bouteille (200–300 ml).',
          "Bois en 3–4 gorgées calmes, idéalement l'après-midi (PM).",
          'Évite de boire 60–90 min avant le coucher.',
        ],
        duration: '1–2 min',
        care: "Adapte selon tes besoins. En cas de restriction hydrique médicale, suis l’avis de ton médecin.",
      }
    case 'box':
      return {
        why: 'Réduire la tension et améliorer la récupération par la respiration contrôlée.',
        how: [
          'Assieds-toi confortablement, épaules relâchées.',
          'Inspire 4 s → bloque 4 s → expire 4 s → bloque 4 s.',
          'Répète doucement pendant ~2 minutes.',
        ],
        duration: '~2 min',
        care: "Arrête en cas d’inconfort, étourdissements, grossesse à risque.",
      }
    default:
      return {
        why: 'Stimuler le système parasympathique et favoriser un état de calme.',
        how: [
          'Assieds-toi, dos long.',
          'Inspire 5 s par le nez.',
          'Expire 5 s par la bouche (ou nez) en douceur.',
          'Répète 1–2 minutes.',
        ],
        duration: '1–2 min',
        care: undefined as string | undefined,
      }
  }
}
