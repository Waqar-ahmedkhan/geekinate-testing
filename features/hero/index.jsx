'use client';

import { Fragment } from 'react';
import { Actions, Eyebrow, Section } from '@/components';
import { globe } from '@/lib/input/globe';
import { heroContent, services } from '@/lib/content';
import { LAYOUT } from '@/constants';

const HEADLINE =
  'mt-5 max-w-[18ch] text-pretty font-display text-[clamp(2.4rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper sm:mt-6';
const PILLAR = 'cursor-default rounded-sm px-1 outline-none transition-colors duration-200 hover:text-volt focus-visible:text-volt';

export default function Hero() {
  const { headline, body, actions } = heroContent;
  const light = (index) => () => {
    globe.pillar = index;
  };
  const clear = () => {
    globe.pillar = -1;
  };
  const pillarEls = services.map(({ title }, index) => (
    <Fragment key={title}>
      {index > 0 ? (
        <span aria-hidden='true' className='hidden sm:inline'>
          ·
        </span>
      ) : null}
      <span tabIndex={0} className={PILLAR} onMouseEnter={light(index)} onMouseLeave={clear} onFocus={light(index)} onBlur={clear}>
        {title}
      </span>
    </Fragment>
  ));
  return (
    <Section
      id='hero'
      variant='clear'
      className='-mt-[var(--nav-rail)] flex min-h-svh flex-col items-center px-6 pb-0 pt-[calc(var(--nav-rail)+2rem)] sm:pt-[calc(var(--nav-rail)+3.5rem)] md:px-10'
    >
      <div className='relative flex w-full flex-col items-center text-center' style={{ maxWidth: LAYOUT.container }}>
        <Eyebrow>
          <span className='flex flex-col items-center gap-y-1 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2'>{pillarEls}</span>
        </Eyebrow>
        <h1 className={HEADLINE}>
          {headline.lead} <span className='text-paper/45'>{headline.trail}</span>
        </h1>
        <p className='mt-4 max-w-[52ch] text-base leading-[1.6] text-mut sm:mt-6 md:text-lg'>{body}</p>
        <div data-globe-floor='' className='mt-6 sm:mt-9'>
          <Actions items={actions} className='justify-center' />
        </div>
      </div>
    </Section>
  );
}
