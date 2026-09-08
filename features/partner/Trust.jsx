import { Card, Eyebrow, Section } from '@/components';
import { partnerTrust } from '@/lib/content';

export default function Trust() {
  const { eyebrow, heading, lead, promises } = partnerTrust;
  const promiseEls = promises.map(({ title, body }) => (
    <Card key={title}>
      <h3 className='text-lg leading-tight tracking-[-0.01em] text-paper'>{title}</h3>
      {body.map((line) => (
        <p key={line} className='text-sm leading-[1.6] text-mut'>
          {line}
        </p>
      ))}
    </Card>
  ));
  return (
    <Section id='trust' variant='ink'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em] text-paper'>
            {heading}
          </h2>
          <p className='text-base leading-[1.6] text-mut'>{lead}</p>
        </header>
        <div className='grid gap-4 sm:grid-cols-2'>{promiseEls}</div>
      </div>
    </Section>
  );
}
