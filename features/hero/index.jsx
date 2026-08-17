'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Eyebrow, Section } from '@/components';
import { cn } from '@/lib/utils';
import { globe } from '@/lib/input/globe';
import { heroContent } from '@/lib/content';
import { LAYOUT } from '@/constants';

// Section 01. Rebuilt on 2026-08-13 against docs/istockphoto-1405728317-612x612.jpg: the copy stacked at the top of a dark screen
// and a dot-matrix Earth rising out of the bottom edge.
//
// **There is no canvas in here.** The globe is a pose of the page's own particle cloud, on the fixed canvas the app shell mounts, so
// this section paints nothing and holds nothing — it is the copy, and the ground it stands on is the page's. That is also why it has
// no fill: a background on this section would sit at z-10 and cover the very thing it exists to frame.
//
// A client component only because the pillars are controls. Hovering one writes into the scene's input singleton and lights that
// quarter of the globe's network — see lib/input/globe.
const ACTION = 'border-brutal rounded-full px-6 py-3 text-sm transition-colors duration-200 ease-brutal';
const PILLAR = 'cursor-default rounded-sm px-1 outline-none transition-colors duration-200 hover:text-volt focus-visible:text-volt';

export default function Hero() {
  const { pillars, headline, actions } = heroContent;
  // Written straight into the singleton the frame loop samples rather than through state. The hover changes nothing React renders —
  // the highlight itself is a CSS hover — so a state update here would re-render the section to tell the scene a number.
  const light = (index) => () => {
    globe.pillar = index;
  };
  const clear = () => {
    globe.pillar = -1;
  };
  const pillarEls = pillars.map((label, index) => (
    <Fragment key={label}>
      {index > 0 ? <span aria-hidden='true'>·</span> : null}
      <span tabIndex={0} className={PILLAR} onMouseEnter={light(index)} onMouseLeave={clear} onFocus={light(index)} onBlur={clear}>
        {label}
      </span>
    </Fragment>
  ));
  const actionEls = actions.map(({ label, href, accent }) => (
    <Link
      key={label}
      href={href}
      className={cn(ACTION, accent ? 'bg-volt text-ink shadow-brutal-sm hover:bg-volt/85' : 'text-paper hover:bg-lift')}
    >
      {label}
    </Link>
  ));
  return (
    // The negative top margin cancels the navbar's rail, which is sticky and so occupies flow space at the top of the page. Without
    // it the section runs from the rail to the fold rather than filling the viewport, and the globe — which is fitted to the
    // viewport, not to the document — sits a rail's height lower than the composition it was measured for.
    <Section
      id='hero'
      variant='clear'
      className='-mt-[var(--nav-rail)] flex min-h-svh flex-col items-center px-6 pb-0 pt-[calc(var(--nav-rail)+3.5rem)] md:px-10'
    >
      {/* Centred rather than left-aligned: the composition is top-to-bottom now, so a column of type hanging off the left rail would
          sit against the widest part of the globe's curve with nothing balancing it. */}
      <div className='relative flex w-full flex-col items-center text-center' style={{ maxWidth: LAYOUT.container }}>
        <Eyebrow>
          <span className='flex flex-wrap justify-center gap-x-2'>{pillarEls}</span>
        </Eyebrow>
        {/* The second half at low alpha is the reference's device and the reason the copy is authored as two halves. Paper rather
            than ink now that the ground is dark, and at a higher alpha than the ink version ran at: 35% of ink on white is legible
            as a grey, 35% of paper on near-black is almost gone. */}
        <h1 className='mt-6 max-w-[18ch] font-display text-[clamp(2.6rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper'>
          {headline.lead} <span className='text-paper/45'>{headline.trail}</span>
        </h1>
        <div className='mt-9 flex flex-wrap justify-center gap-3'>{actionEls}</div>
      </div>
    </Section>
  );
}
