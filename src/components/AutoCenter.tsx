'use client'

import { useEffect } from 'react'

export default function AutoCenter({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (el) {
      // petit délai pour laisser le rendu s’installer
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
  }, [targetId])
  return null
}
