'use client'

export default function RestActiveTile({ level }: { level: 'orange' | 'red' }) {
  const title = level === 'red' ? 'Repos actif (si capable)' : 'Repos actif (recommandé)'
  return (
    <section className="mb-6 rounded-2xl border p-4">
      <div className="text-sm uppercase opacity-60">{title}</div>
      <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed">
        <li>Marche zone 1 (10–20 min) <em>ou</em> Mobilité (10 min).</li>
        <li>Terminer par Cohérence 5-5 (1–2 min).</li>
      </ul>
      <p className="mt-2 text-xs opacity-70">Cette tuile n’apparaît que les jours <strong>Repos</strong> si douleur moyenne élevée ou sommeil non réparateur.</p>
    </section>
  )
}
