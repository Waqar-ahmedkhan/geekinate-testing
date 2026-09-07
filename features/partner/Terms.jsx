import { Eyebrow, Section } from '@/components';
import { partnerTerms } from '@/lib/content';

export default function Terms() {
  const { eyebrow, heading, body } = partnerTerms;
  const bodyEls = body.map((line) => (
    <p key={line} className='max-w-[70ch] text-sm leading-[1.7] text-mut'>
      {line}
    </p>
  ));
  return (
    <Section variant='ink' className='py-14 md:py-16'>
      <div className='mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-3'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.01em] text-paper'>
            {heading}
          </h2>
        </header>
        <div className='flex flex-col gap-4'>{bodyEls}</div>
      </div>
    </Section>
  );
}
