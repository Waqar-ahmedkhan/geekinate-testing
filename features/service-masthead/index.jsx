import { Section } from '@/components';
import { InViewVideo } from '@/lib/ui/reusable_components';

const SPEC = 'flex flex-col gap-2 border-t-[1.5px] border-line pt-5 lg:col-span-4';
const PANEL = 'aspect-[4/3] lg:absolute lg:inset-x-0 lg:-inset-y-6 lg:aspect-auto';

export default function ServiceMasthead({ service }) {
  const { title, headline, lead, facts, media } = service;
  const specEls = facts.map(({ label, value }) => (
    <div key={label} className={SPEC}>
      <dt className='font-mono text-[11px] uppercase tracking-[0.18em] text-mut'>{label}</dt>
      <dd className='text-lg leading-tight text-paper'>{value}</dd>
    </div>
  ));
  return (
    <Section
      variant='ink'
      className='-mt-[var(--nav-rail)] flex min-h-svh flex-col pb-12 pt-[calc(var(--nav-rail)+2.5rem)] md:pb-14 md:pt-[calc(var(--nav-rail)+3rem)]'
    >
      <div className='grid min-h-0 flex-1 gap-y-12 py-4 lg:grid-cols-12 lg:gap-x-8'>
        <div className='flex flex-col justify-center gap-8 lg:col-span-6'>
          <h1 className='font-display text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.96] tracking-[-0.02em] text-paper'>{title}</h1>
          <p className='font-display text-[clamp(1.5rem,2.4vw,2.375rem)] leading-[1.2] text-paper'>
            {headline.lead} <span className='italic text-volt'>{headline.mark}</span> {headline.trail}
          </p>
          <p className='max-w-[46ch] text-lg leading-[1.6] text-mut'>{lead}</p>
        </div>
        <div className='relative min-h-0 lg:col-span-6 lg:col-start-7'>
          <div className={PANEL}>
            <InViewVideo media={media} fit='contain' loop className='mix-blend-screen' />
          </div>
        </div>
      </div>
      <dl className='mt-auto grid gap-x-8 gap-y-6 pt-10 sm:grid-cols-2 lg:grid-cols-12'>{specEls}</dl>
    </Section>
  );
}
