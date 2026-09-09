'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TYPED } from '@/constants';

const CARET =
  'ml-[0.06em] inline-block h-[0.72em] w-[0.05em] min-w-[2px] translate-y-[0.02em] bg-current motion-safe:animate-caret motion-reduce:hidden';

export default function TypedHeading({ text, as: Heading = 'h2', className }) {
  const [shown, setShown] = useState(text);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let at = text.length;
    let erasing = true;
    let timer = 0;
    const tick = () => {
      at = erasing ? at - 1 : at + 1;
      setShown(text.slice(0, at));
      if (erasing && at <= 0) erasing = false;
      else if (!erasing && at >= text.length) erasing = true;
      const pause = at >= text.length ? TYPED.holdMs : at <= 0 ? TYPED.restMs : erasing ? TYPED.eraseMs : TYPED.typeMs;
      timer = window.setTimeout(tick, pause);
    };
    const start = window.setTimeout(() => {
      setTyping(true);
      tick();
    }, TYPED.startMs);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [text]);

  return (
    <Heading className={cn('relative', className)}>
      <span aria-hidden='true' className='invisible'>
        {text}
      </span>
      <span className='absolute inset-0'>
        {shown}
        {typing ? <span aria-hidden='true' className={CARET} /> : null}
      </span>
    </Heading>
  );
}
