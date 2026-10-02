'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TYPED } from '@/constants';

const CARET =
  'ml-[0.06em] inline-block h-[0.72em] w-[0.05em] min-w-[2px] translate-y-[0.02em] bg-current motion-safe:animate-caret motion-reduce:hidden';

const pauseFor = (at, length, erasing) => (at >= length ? TYPED.holdMs : at <= 0 ? TYPED.restMs : erasing ? TYPED.eraseMs : TYPED.typeMs);

export default function TypedHeading({ phrases, as: Heading = 'h2', className }) {
  const [first] = phrases;
  const [shown, setShown] = useState(first);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (phrases.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let index = 0,
      at = phrases[0].length,
      erasing = true,
      timer = 0;
    const tick = () => {
      const phrase = phrases[index];
      at = erasing ? at - 1 : at + 1;
      setShown(phrase.slice(0, at));
      const pause = pauseFor(at, phrase.length, erasing);
      if (erasing && at <= 0) {
        erasing = false;
        index = (index + 1) % phrases.length;
      } else if (!erasing && at >= phrase.length) erasing = true;
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
  }, [phrases]);
  const ghostEls = phrases.map((phrase) => (
    <span key={phrase} className='col-start-1 row-start-1'>
      {phrase}
    </span>
  ));
  return (
    <Heading className={cn('relative', className)}>
      <span className='sr-only'>{first}</span>
      <span aria-hidden='true' className='invisible grid'>
        {ghostEls}
      </span>
      <span aria-hidden='true' className='absolute inset-0'>
        {shown}
        {typing ? <span className={CARET} /> : null}
      </span>
    </Heading>
  );
}
