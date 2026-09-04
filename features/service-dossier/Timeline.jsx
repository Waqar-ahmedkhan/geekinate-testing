'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { orderLabel } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const SPINE = 'pointer-events-none absolute bottom-3 left-[6px] top-3 w-[3px]';
const NODE = 'absolute left-0 top-[5px] size-[15px] rounded-full border-[1.5px] border-line bg-paper';
const TRACK = 'bg-ink/10';

export default function Timeline({ steps }) {
  const frame = useRef(null);
  const spine = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        spine.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: frame.current, start: 'top 72%', end: 'bottom 62%', scrub: true, invalidateOnRefresh: true },
        }
      );
    });
    return () => media.revert();
  }, []);
  const stepEls = steps.map(({ title, detail }, order) => (
    <li key={title} className='relative pl-10'>
      <span aria-hidden='true' className={NODE} />
      <span className='font-mono text-[11px] tracking-[0.18em] text-mut'>{orderLabel(order)}</span>
      <h3 className='mt-2 text-xl leading-tight tracking-[-0.01em]'>{title}</h3>
      <p className='mt-2 max-w-[54ch] text-sm leading-[1.6] text-mut'>{detail}</p>
    </li>
  ));
  return (
    <ol ref={frame} className='relative flex flex-col gap-10'>
      <span aria-hidden='true' className={`${SPINE} ${TRACK}`} />
      <span ref={spine} aria-hidden='true' className={`${SPINE} origin-top bg-volt will-change-transform`} />
      {stepEls}
    </ol>
  );
}
