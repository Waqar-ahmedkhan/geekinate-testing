import { DeckCard, Eyebrow, Section, SectionHead } from '@/components';
import { orderLabel } from '@/lib/utils';

export default function Scope({ block, intro, items }) {
  const cardEls = items.map(({ title, detail }, index) => (
    <DeckCard key={title} onPaper>
      <Eyebrow>{orderLabel(index)}</Eyebrow>
      <h3 className='text-xl leading-tight tracking-[-0.01em] text-foreground'>{title}</h3>
      <p className='text-sm leading-[1.6] text-mut'>{detail}</p>
    </DeckCard>
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
