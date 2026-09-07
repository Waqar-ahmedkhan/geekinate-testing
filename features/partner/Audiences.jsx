import Card from './Card';
import { Eyebrow, Section, SectionHead } from '@/components';
import { partnerAudiences } from '@/lib/content';

export default function Audiences() {
  const { eyebrow, heading, cards } = partnerAudiences;
  const cardEls = cards.map(({ title, body }, index) => (
    <Card key={title} onPaper>
      <Eyebrow>{String(index + 1).padStart(2, '0')}</Eyebrow>
      <h3 className='text-xl leading-tight tracking-[-0.01em] text-foreground'>{title}</h3>
      {body.map((line) => (
        <p key={line} className='text-sm leading-[1.6] text-mut'>
          {line}
        </p>
      ))}
    </Card>
  ));
  return (
    <Section variant='paper' className='border-t-[1.5px] border-line'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={eyebrow} heading={heading} />
        <div className='grid gap-4 md:grid-cols-2'>{cardEls}</div>
      </div>
    </Section>
  );
}
