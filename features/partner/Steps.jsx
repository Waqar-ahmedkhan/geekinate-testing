import { Eyebrow, Section } from '@/components';
import { partnerSteps } from '@/lib/content';

const STEP_INDEX =
  'flex size-9 shrink-0 items-center justify-center rounded-full border-brutal bg-paper font-mono text-xs text-ink shadow-brutal-sm';

export default function Steps() {
  const { eyebrow, heading, intro, steps } = partnerSteps;
  const stepEls = steps.map(({ title, detail }, index) => (
    <li key={title} className='flex gap-5 border-t-[1.5px] border-line pt-6'>
      <span aria-hidden='true' className={STEP_INDEX}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className='flex flex-col gap-2'>
        <h3 className='text-xl leading-tight tracking-[-0.01em] text-ink'>{title}</h3>
        {detail.map((line) => (
          <p key={line} className='max-w-[62ch] text-sm leading-[1.6] text-ink-soft'>
            {line}
          </p>
        ))}
      </div>
    </li>
  ));
  return (
    <Section id='how-it-works' variant='paper'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{heading}</h2>
          <p className='max-w-[40ch] text-base leading-[1.6] text-mut'>{intro}</p>
        </header>
        <ol className='flex flex-col gap-6'>{stepEls}</ol>
      </div>
    </Section>
  );
}
