import { Actions, Section } from '@/components';
import { heroContent } from '@/lib/content';
import { LAYOUT } from '@/constants';

const HEADLINE =
  'max-w-[18ch] text-pretty font-display text-[clamp(2.4rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper';

export default function Hero() {
  const { headline, body, actions } = heroContent;
  return (
    <Section
      id='hero'
      variant='clear'
      className='-mt-[var(--nav-rail)] flex min-h-svh touch-pan-y touch-pinch-zoom flex-col items-center px-6 pb-0 pt-[calc(var(--nav-rail)+2rem)] sm:pt-[calc(var(--nav-rail)+3.5rem)] md:px-10'
    >
      <div className='relative flex w-full flex-col items-center text-center' style={{ maxWidth: LAYOUT.container }}>
        <h1 className={HEADLINE}>
          {headline.lead} <span className='text-paper/45'>{headline.trail}</span>
        </h1>
        <p className='mt-4 max-w-[52ch] text-balance text-base leading-[1.6] text-mut sm:mt-6 md:text-lg'>{body}</p>
        <div data-globe-floor='' className='mt-6 sm:mt-9'>
          <Actions items={actions} className='justify-center' />
        </div>
      </div>
    </Section>
  );
}
