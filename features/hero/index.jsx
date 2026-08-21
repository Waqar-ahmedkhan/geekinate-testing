'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Eyebrow, Section } from '@/components';
import { cn } from '@/lib/utils';
import { globe } from '@/lib/input/globe';
import { heroContent } from '@/lib/content';
import { LAYOUT } from '@/constants';

const ACTION = 'border-brutal rounded-full px-6 py-3 text-sm transition-colors duration-200 ease-brutal';
const PILLAR = 'cursor-default rounded-sm px-1 outline-none transition-colors duration-200 hover:text-volt focus-visible:text-volt';

export default function Hero() {
  const { pillars, headline, actions } = heroContent;
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
    <Section
      id='hero'
      variant='clear'
      className='-mt-[var(--nav-rail)] flex min-h-svh flex-col items-center px-6 pb-0 pt-[calc(var(--nav-rail)+3.5rem)] md:px-10'
    >
      <div className='relative flex w-full flex-col items-center text-center' style={{ maxWidth: LAYOUT.container }}>
        <Eyebrow>
          <span className='flex flex-wrap justify-center gap-x-2'>{pillarEls}</span>
        </Eyebrow>
        <h1 className='mt-6 max-w-[18ch] font-display text-[clamp(2.6rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper'>
          {headline.lead} <span className='text-paper/45'>{headline.trail}</span>
        </h1>
        <div className='mt-9 flex flex-wrap justify-center gap-3'>{actionEls}</div>
      </div>
    </Section>
  );
}
