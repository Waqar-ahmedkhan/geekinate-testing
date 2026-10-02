'use client';

import { useEffect, useRef, useState } from 'react';
import Eyebrow from '@/components/layout/Eyebrow';
import { cn, orderLabel } from '@/lib/utils';
import { PROCESS } from '@/constants';

const GRID = 'mx-auto grid w-full max-w-6xl gap-10 lg:items-start lg:gap-16';
const HEAD = 'flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]';
const HEADING = 'max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]';
const INTRO = 'max-w-[40ch] text-base leading-[1.6] text-mut';
const LIST =
  'grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 border-b-[1.5px] border-line md:grid-cols-[2.25rem_max-content_minmax(0,1fr)] md:gap-x-8';
const ROW =
  'relative col-span-full grid w-full cursor-pointer grid-cols-subgrid items-center gap-y-2 border-t-[1.5px] border-line py-5 text-left';
const BAR = 'absolute inset-x-0 -top-[2px] h-1 origin-left bg-volt';
const RUN = 'animate-step-fill motion-reduce:animate-none';
const NUMBER = 'font-mono text-xs transition-colors duration-300';
const TITLE = 'font-display tracking-[-0.01em] transition-colors duration-300';
const WORD = 'text-[clamp(2.8rem,5.6vw,4.75rem)] leading-[0.95]';
const LINE = 'text-[clamp(2rem,3.6vw,3rem)] leading-[1.05]';
const DETAIL = 'col-start-2 max-w-[36ch] text-base leading-[1.5] transition-colors duration-300 md:col-start-3';
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
  const stacked = items.some(({ title }) => title.includes(' '));
  const introEl = block.intro ? <p className={INTRO}>{block.intro}</p> : null;
  const rowEls = items.map(({ title, detail }, index) => {
    const on = index === active;
    const pick = () => setActive(index);
    const barEl = on ? (
      <span key={playing ? `run-${active}` : 'still'} aria-hidden='true' className={cn(BAR, playing && RUN)} style={barStyle} />
    ) : null;
    return (
      <li key={title} className='col-span-full grid grid-cols-subgrid'>
        <button type='button' aria-current={on ? 'step' : undefined} onMouseEnter={pick} onFocus={pick} onClick={pick} className={ROW}>
          {barEl}
          <span className={cn(NUMBER, on ? 'text-foreground' : 'text-mut')}>{orderLabel(index)}</span>
          <span className={cn(TITLE, stacked ? LINE : WORD, on ? 'text-foreground' : 'text-mut/70')}>{title}</span>
          <span className={cn(DETAIL, stacked && 'md:col-start-2', on ? 'text-foreground' : 'text-mut')}>{detail}</span>
        </button>
      </li>
    );
  });
  return (
    <div ref={rootRef} className={cn(GRID, mirror ? 'lg:grid-cols-[8fr_4fr]' : 'lg:grid-cols-[4fr_8fr]')}>
      <header className={HEAD}>
        <Eyebrow>{block.label}</Eyebrow>
        <h2 className={HEADING}>{block.heading}</h2>
        {introEl}
      </header>
      <ol
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={releaseFocus}
        className={cn(LIST, stacked && 'md:grid-cols-[2.25rem_minmax(0,1fr)]', mirror && 'lg:order-first')}
      >
        {rowEls}
      </ol>
    </div>
  );
}
