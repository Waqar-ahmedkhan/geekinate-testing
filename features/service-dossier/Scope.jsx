import { LiftCard, RollIndex, Section, SectionHead } from '@/components';
import { orderLabel } from '@/lib/utils';

const RISE = 'transition-[color,translate] duration-[460ms] ease-brutal group-hover/lift:-translate-y-0.5 motion-reduce:transition-none';
const TITLE = `text-xl leading-tight tracking-[-0.01em] text-foreground group-hover/lift:text-volt group-hover/lift:delay-[40ms] ${RISE}`;
const DETAIL = `text-sm leading-[1.6] text-mut group-hover/lift:delay-[80ms] ${RISE}`;

export default function Scope({ block, intro, items }) {
  const cardEls = items.map(({ title, detail }, index) => (
    <LiftCard key={title} onPaper>
      <RollIndex value={orderLabel(index)} />
      <h3 className={TITLE}>{title}</h3>
      <p className={DETAIL}>{detail}</p>
    </LiftCard>
  ));
  return (
    <Section id={block.id} variant='paper' className='scroll-mt-[var(--nav-rail)]'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={block.label} heading={block.heading} body={intro} />
        <div className='grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3'>{cardEls}</div>
      </div>
    </Section>
  );
}
