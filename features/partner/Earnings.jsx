import { Card, Eyebrow, Section, SectionHead } from '@/components';
import { partnerEarnings } from '@/lib/content';

export default function Earnings() {
  const { eyebrow, heading, examples, footnote, followOn } = partnerEarnings;
  const exampleEls = examples.map(({ engagement, rate, payout }) => (
    <Card key={engagement} onPaper className='gap-4'>
      <span className='text-sm leading-[1.5] text-mut'>{engagement}</span>
      <Eyebrow>{rate}</Eyebrow>
      <span className='mt-auto font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-none tracking-[-0.02em] tabular-nums text-foreground'>
        {payout}
      </span>
    </Card>
  ));
  return (
    <Section variant='paper'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={eyebrow} heading={heading} />
        <div className='grid gap-4 md:grid-cols-3'>{exampleEls}</div>
        <div className='mt-8 flex flex-col gap-3'>
          <p className='max-w-[70ch] text-sm leading-[1.6] text-grey'>{footnote}</p>
          <p className='max-w-[70ch] text-sm leading-[1.6] text-ink-soft'>{followOn}</p>
        </div>
      </div>
    </Section>
  );
}
