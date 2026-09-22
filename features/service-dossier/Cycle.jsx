'use client';

import { useEffect, useRef, useState } from 'react';
import { Eyebrow } from '@/components';
import { cn, orderLabel } from '@/lib/utils';
import { PROCESS } from '@/constants';

const GRID = 'mx-auto grid w-full max-w-6xl gap-10 lg:items-start lg:gap-16';
const HEAD = 'flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]';
const HEADING = 'max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]';
const ROW =
  'relative grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-t-[1.5px] border-line py-5 text-left md:grid-cols-[2.25rem_auto_minmax(0,1fr)] md:gap-x-8';
const BAR = 'absolute inset-x-0 -top-[2px] h-1 origin-left bg-volt';
const RUN = 'animate-step-fill motion-reduce:animate-none';
const NUMBER = 'font-mono text-xs transition-colors duration-300';
const TITLE = 'font-display text-[clamp(2.8rem,5.6vw,4.75rem)] leading-[0.95] tracking-[-0.01em] transition-colors duration-300';
const DETAIL =
  'col-start-2 max-w-[36ch] text-base leading-[1.5] text-mut md:col-start-3 md:transition-[opacity,translate] md:ease-brutal motion-reduce:transition-none';
const DETAIL_ON = 'md:translate-x-0 md:opacity-100 md:delay-100 md:duration-500';
const DETAIL_OFF = 'md:-translate-x-3.5 md:opacity-0 md:duration-200';
const REDUCED = '(prefers-reduced-motion: reduce)';

const halfInView = ({ isIntersecting, intersectionRect, boundingClientRect }) =>
  isIntersecting && intersectionRect.height >= Math.min(boundingClientRect.height, window.innerHeight) * PROCESS.inView;

export default function Cycle({ block, items, mirror = false }) {
  const rootRef = useRef(null);
  const [active, setActive] = useState(0);
  const [holding, setHolding] = useState(false);
  const [inView, setInView] = useState(false);
  const playing = inView && !holding;
  useEffect(() => {
    const watcher = new IntersectionObserver(([entry]) => setInView(halfInView(entry)), { threshold: [0, 0.25, 0.5, 0.75, 1] });
    watcher.observe(rootRef.current);
    return () => watcher.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || window.matchMedia(REDUCED).matches) return undefined;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % items.length), PROCESS.dwellMs);
    return () => window.clearTimeout(timer);
  }, [playing, active, items.length]);
  const hold = () => setHolding(true);
  const release = () => setHolding(false);
  const releaseFocus = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHolding(false);
  };
  const barStyle = { animationDuration: `${PROCESS.dwellMs}ms` };
  const rowEls = items.map(({ title, detail }, index) => {
    const on = index === active;
    const pick = () => setActive(index);
    const barEl = on ? (
      <span key={playing ? `run-${active}` : 'still'} aria-hidden='true' className={cn(BAR, playing && RUN)} style={barStyle} />
    ) : null;
    return (
      <li key={title}>
        <button type='button' aria-current={on ? 'step' : undefined} onMouseEnter={pick} onFocus={pick} onClick={pick} className={ROW}>
          {barEl}
          <span className={cn(NUMBER, on ? 'text-foreground' : 'text-mut')}>{orderLabel(index)}</span>
          <span className={cn(TITLE, on ? 'text-foreground' : 'text-mut/40')}>{title}</span>
          <span className={cn(DETAIL, on ? DETAIL_ON : DETAIL_OFF)}>{detail}</span>
        </button>
      </li>
    );
  });
  return (
    <div ref={rootRef} className={cn(GRID, mirror ? 'lg:grid-cols-[8fr_4fr]' : 'lg:grid-cols-[4fr_8fr]')}>
      <header className={HEAD}>
        <Eyebrow>{block.label}</Eyebrow>
        <h2 className={HEADING}>{block.heading}</h2>
      </header>
      <ol
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={releaseFocus}
        className={cn('border-b-[1.5px] border-line', mirror && 'lg:order-first')}
      >
        {rowEls}
      </ol>
    </div>
  );
}
