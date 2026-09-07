import Actions from './Actions';
import FlowRail from './FlowRail';
import { Eyebrow, Section } from '@/components';
import { Separator } from '@/components/ui/separator';
import { partnerHero } from '@/lib/content';

const SHELL =
  '-mt-[var(--nav-rail)] flex min-h-svh flex-col justify-start pt-[calc(var(--nav-rail)+3.5rem)] pb-16 lg:justify-center lg:pt-[calc(var(--nav-rail)+4.5rem)] lg:pb-20';

export default function Hero() {
  const { eyebrow, headline, support, actions, proof } = partnerHero;
  const supportEls = support.map((line) => (
    <p key={line} className='max-w-[52ch] text-base leading-[1.6] text-mut md:text-lg'>
      {line}
    </p>
  ));
  const proofEls = proof.map((item) => (
    <span key={item} className='whitespace-nowrap'>
      {item}
    </span>
  ));
  return (
    <Section id='hero-partner' variant='clear' className={SHELL}>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-14'>
        <div className='grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16'>
          <div className='flex flex-col gap-6'>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className='max-w-[16ch] font-display text-[clamp(2.6rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper'>
              {headline.lead} <span className='text-volt'>{headline.trail}</span>
            </h1>
            <div className='flex flex-col gap-4'>{supportEls}</div>
            <Actions items={actions} location='hero' className='mt-2' />
          </div>
          <FlowRail />
        </div>
        <div className='flex flex-col gap-5'>
          <Separator />
          <p className='flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-mut'>{proofEls}</p>
        </div>
      </div>
    </Section>
  );
}
