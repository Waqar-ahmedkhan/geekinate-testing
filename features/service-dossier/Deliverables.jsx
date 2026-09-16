import { Check } from 'lucide-react';
import { Card, Eyebrow, Section } from '@/components';

const MARKER = 'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-volt text-ink';

export default function Deliverables({ block, items }) {
  const itemEls = items.map((item) => (
    <li key={item} className='flex gap-3 text-base leading-[1.5] text-mut'>
      <span aria-hidden='true' className={MARKER}>
        <Check className='size-3' />
      </span>
      {item}
    </li>
  ));
  return (
    <Section id={block.id} variant='ink' compact className='scroll-mt-[var(--nav-rail)]'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{block.label}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{block.heading}</h2>
        </header>
        <Card className='gap-5'>
          <ul className='flex flex-col gap-4'>{itemEls}</ul>
        </Card>
      </div>
    </Section>
  );
}
