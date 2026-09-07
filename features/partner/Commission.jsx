import Card from './Card';
import { Eyebrow, Section, SectionHead } from '@/components';
import { partnerCommission } from '@/lib/content';

export default function Commission() {
  const { eyebrow, heading, tiers, disclosure } = partnerCommission;
  const tierEls = tiers.map(({ value, title, body, note }) => (
    <Card key={title} className='gap-4'>
      <span className='font-display text-[clamp(3rem,6vw,4.5rem)] leading-none tracking-[-0.02em] text-volt'>{value}</span>
      <Eyebrow>{title}</Eyebrow>
      <p className='text-base leading-[1.6] text-paper'>{body}</p>
      <p className='mt-auto border-t-[1.5px] border-line pt-4 text-sm leading-[1.5] text-mut'>{note}</p>
    </Card>
  ));
  return (
    <Section id='commission' variant='ink'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={eyebrow} heading={heading} />
        <div className='grid gap-4 md:grid-cols-2'>{tierEls}</div>
        <p className='mt-8 text-sm leading-[1.6] text-mut'>{disclosure}</p>
      </div>
    </Section>
  );
}
