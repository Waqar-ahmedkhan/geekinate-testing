import { ArrowRight } from 'lucide-react';
import TrackedLink from './Track';
import Card from './Card';
import { Section, SectionHead } from '@/components';
import { partnerServices } from '@/lib/content';

export default function ServiceFit() {
  const { eyebrow, heading, cards, reassurance } = partnerServices;
  const cardEls = cards.map(({ title, items }) => (
    <Card key={title}>
      <h3 className='text-2xl leading-none tracking-[-0.01em] text-paper'>{title}</h3>
      <ul className='mt-2 flex flex-col gap-2.5'>
        {items.map((item) => (
          <li key={item} className='flex gap-3 text-sm leading-[1.5] text-mut'>
            <span aria-hidden='true' className='mt-2 size-1 shrink-0 rounded-full bg-volt' />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  ));
  return (
    <Section id='what-to-refer' variant='ink'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={eyebrow} heading={heading} />
        <div className='grid gap-4 md:grid-cols-3'>{cardEls}</div>
        <div className='mt-10 flex flex-col items-start gap-3 border-t-[1.5px] border-line pt-8 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-col gap-1.5'>
            <p className='font-display text-2xl leading-none tracking-[-0.01em] text-paper'>{reassurance.lead}</p>
            <p className='max-w-[54ch] text-sm leading-[1.6] text-mut'>{reassurance.body}</p>
          </div>
          <TrackedLink
            href={reassurance.action.href}
            location='services'
            label={reassurance.action.label}
            intent={reassurance.action.intent}
            className='group flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-volt underline decoration-volt/40 decoration-[1.5px] underline-offset-[6px] transition-[text-decoration-color] duration-200 hover:decoration-volt'
          >
            {reassurance.action.label}
            <ArrowRight aria-hidden='true' className='size-3.5 transition-transform duration-200 group-hover:translate-x-1' />
          </TrackedLink>
        </div>
      </div>
    </Section>
  );
}
