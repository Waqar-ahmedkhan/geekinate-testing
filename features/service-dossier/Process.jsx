import { Eyebrow, Section, StepIndex } from '@/components';

export default function Process({ block, steps }) {
  const stepEls = steps.map(({ title, detail }, index) => (
    <li key={title} className='flex gap-5 border-t-[1.5px] border-line pt-6'>
      <StepIndex value={index + 1} />
      <div className='flex flex-col gap-2'>
        <h3 className='text-xl leading-tight tracking-[-0.01em] text-paper'>{title}</h3>
        <p className='max-w-[62ch] text-sm leading-[1.6] text-mut'>{detail}</p>
      </div>
    </li>
  ));
  return (
    <Section id={block.id} variant='ink' className='scroll-mt-[var(--nav-rail)]'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{block.label}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em] text-paper'>
            {block.heading}
          </h2>
        </header>
        <ol className='flex flex-col gap-6'>{stepEls}</ol>
      </div>
    </Section>
  );
}
