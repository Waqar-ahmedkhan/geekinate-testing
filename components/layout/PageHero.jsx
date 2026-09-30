import Eyebrow from './Eyebrow';
import Section from './Section';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const SHELL =
  '-mt-[var(--nav-rail)] flex min-h-svh flex-col justify-start pt-[calc(var(--nav-rail)+3.5rem)] pb-16 lg:justify-center lg:pt-[calc(var(--nav-rail)+4.5rem)] lg:pb-20';
const SPLIT = 'grid gap-12 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16';
const SOLO = 'flex justify-center';
const HEADLINE = 'font-display text-[clamp(2.6rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper';
const PROOF = 'flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.14em] text-mut';

export default function PageHero({ id, eyebrow, headline, measure = 'max-w-[16ch]', support, actions, aside, proof }) {
  const centred = !aside;
  const columnClass = cn('flex flex-col gap-6', centred && 'items-center text-center');
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
  const proofEl = proof.length ? (
    <div className='flex flex-col gap-5'>
      <Separator />
      <p className={cn(PROOF, centred && 'justify-center')}>{proofEls}</p>
    </div>
  ) : null;
  return (
    <Section id={id} variant='clear' className={SHELL}>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-14'>
        <div className={centred ? SOLO : SPLIT}>
          <div className={columnClass}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className={cn(HEADLINE, measure)}>{headline}</h1>
            <div className='flex flex-col gap-4'>{supportEls}</div>
            {actions}
          </div>
          {aside}
        </div>
        {proofEl}
      </div>
    </Section>
  );
}
