import FaqList from './FaqList';
import { Eyebrow, Section } from '@/components';
import { partnerFaq } from '@/lib/content';

export default function Faq() {
  const { eyebrow, heading, items } = partnerFaq;
  return (
    <Section id='faq' variant='paper'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16'>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='max-w-[12ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{heading}</h2>
        </header>
        <FaqList items={items} />
      </div>
    </Section>
  );
}
