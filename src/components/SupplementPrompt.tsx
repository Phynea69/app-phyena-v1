'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSupplementState, markSupplement } from '@/app/(app)/actions/checkins';

type Props = {
  userId: string;           // passé par la page
  date: string;             // 'YYYY-MM-DD' (passé par la page)
};

const BRAND = {
  copper: '#C8742E',
  border: 'rgba(200,116,46,0.55)',
} as const;

function currentSlot(now = new Date()) {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'am' as const;
  if (h >= 17 && h < 23) return 'pm' as const;
  return null;
}

const guardKey = (date: string, slot: 'am' | 'pm') => `regen_prompt_${date}_${slot}`;

export default function SupplementPrompt({ userId, date }: Props) {
  const [isClient, setIsClient] = useState(false);
  const [delayPassed, setDelayPassed] = useState(false);
  const [sessionGuard, setSessionGuard] = useState(true);
  const [already, setAlready] = useState<boolean | null>(null); // état DB (true/false/null)
  const slot = useMemo(() => currentSlot(), []);

  // 1) montée client + délai ~3,2 s + lecture guard session
  useEffect(() => {
    setIsClient(true);
    const t = setTimeout(() => setDelayPassed(true), 3200);
    if (typeof window !== 'undefined' && slot) {
      setSessionGuard(sessionStorage.getItem(guardKey(date, slot)) === '1');
    }
    return () => clearTimeout(t);
  }, [date, slot]);

  // 2) lire l'état depuis la DB via server action
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!userId || !slot) return;
      const { value } = await getSupplementState({ user_id: userId, date, slot });
      if (alive) setAlready(value);
    })();
    return () => {
      alive = false;
    };
  }, [userId, date, slot]);

  const needAsk =
    !!slot &&
    already !== true &&         // ne pas demander si déjà validé
    !sessionGuard &&            // ne pas redemander dans la même session si dismiss
    delayPassed;

  if (!isClient || !needAsk) return null;

  const title = slot === 'am' ? 'Compléments du matin (REGEN+)' : 'Compléments du soir (REGEN+)';
  const subtitle =
    slot === 'am'
      ? 'As-tu pris tes gélules du matin avec le petit-déjeuner ?'
      : 'As-tu pris tes gélules du soir avec le dîner ?';

  async function answer(value: boolean | 'later') {
    if (!slot) return;
    if (value !== 'later') {
      await markSupplement({ user_id: userId, date, slot, value });
      setAlready(value); // refléter immédiatement
    }
    // Dans tous les cas, on ne ré-affiche plus dans cette session
    sessionStorage.setItem(guardKey(date, slot), '1');
    setSessionGuard(true);
  }

  const overlay = (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-xl" style={{ borderColor: BRAND.border }}>
        <div className="text-sm uppercase opacity-70" style={{ color: BRAND.copper }}>{title}</div>
        <div className="mt-2 text-base">{subtitle}</div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="rounded-2xl border px-4 py-2" style={{ borderColor: BRAND.border }} onClick={() => answer(true)}>
            Oui
          </button>
          <button className="rounded-2xl border px-4 py-2" style={{ borderColor: BRAND.border }} onClick={() => answer(false)}>
            Pas encore
          </button>
        </div>

        <button className="mt-3 w-full text-sm underline opacity-80" onClick={() => answer('later')}>
          Me redemander plus tard
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
