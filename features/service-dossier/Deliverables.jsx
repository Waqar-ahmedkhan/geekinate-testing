import { Check } from 'lucide-react';
import { Card, Section, SectionHead } from '@/components';

const MARKER = 'flex size-9 items-center justify-center rounded-full bg-volt text-ink';
const STATEMENT = 'max-w-[22ch] font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.1] tracking-[-0.01em] text-paper';

export default function Deliverables({ block, items }) {
  const itemEls = items.map((item) => (
    <li key={item}>
      <Card className='min-h-56 justify-between gap-10'>
        <span aria-hidden='true' className={MARKER}>
          <Check className='size-4' />
        </span>
        <p className={STATEMENT}>{item}</p>
      </Card>
    </li>
  ));
  return (
    <Section id={block.id} variant='ink' className='scroll-mt-[var(--nav-rail)]'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={block.label} heading={block.heading} />
        <ul className='grid gap-6 md:grid-cols-2'>{itemEls}</ul>
      </div>
    </Section>
  );
}
