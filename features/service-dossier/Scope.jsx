import { Card, Eyebrow, Section, SectionHead } from '@/components';
import { orderLabel } from '@/lib/utils';

export default function Scope({ block, items }) {
  const cardEls = items.map(({ title, detail }, index) => (
    <Card key={title} onPaper>
      <Eyebrow>{orderLabel(index)}</Eyebrow>
      <h3 className='text-xl leading-tight tracking-[-0.01em] text-foreground'>{title}</h3>
      <p className='text-sm leading-[1.6] text-mut'>{detail}</p>
    </Card>
  ));
  return (
    <Section id={block.id} variant='paper'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={block.label} heading={block.heading} />
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>{cardEls}</div>
      </div>
    </Section>
  );
}
