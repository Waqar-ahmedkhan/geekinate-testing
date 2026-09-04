'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Section } from '@/components';
import Block from './Block';
import Timeline from './Timeline';
import { cn, orderLabel } from '@/lib/utils';
import { servicePageContent } from '@/lib/content';

const RAIL_ROW = 'flex items-baseline gap-3 border-l-[1.5px] py-2 pl-4 transition-colors duration-200 ease-brutal';
const LEDGER_ROW = 'grid gap-x-8 gap-y-1 border-t-[1.5px] border-line py-5 md:grid-cols-12';
const CHECK_ROW = 'flex items-start gap-3 border-t-[1.5px] border-line py-4';
const CTA =
  'border-brutal w-fit rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-ink shadow-brutal-sm transition-colors duration-200 ease-brutal hover:bg-volt/85';

export default function ServiceDossier({ service }) {
  const { scope, steps, deliverables } = service;
  const { contents, cta, blocks } = servicePageContent;
  const [active, setActive] = useState(blocks[0].id);
  useEffect(() => {
    const watcher = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)), {
      rootMargin: '-22% 0px -56% 0px',
    });
    blocks.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) watcher.observe(node);
    });
    return () => watcher.disconnect();
  }, [blocks]);
  const railEls = blocks.map(({ id, label }, order) => (
    <li key={id}>
      <a
        href={`#${id}`}
        aria-current={active === id ? 'location' : undefined}
        className={cn(RAIL_ROW, active === id ? 'border-l-volt text-ink' : 'border-l-line text-mut hover:text-ink')}
      >
        <span className='font-mono text-[11px] tracking-[0.18em]'>{orderLabel(order)}</span>
        <span className='text-sm leading-tight'>{label}</span>
      </a>
    </li>
  ));
  const ledgerEls = scope.map(({ title, detail }, order) => (
    <li key={title} className={LEDGER_ROW}>
      <span className='font-mono text-[11px] tracking-[0.18em] text-mut md:col-span-1'>{orderLabel(order)}</span>
      <h3 className='text-base leading-tight md:col-span-4'>{title}</h3>
      <p className='max-w-[54ch] text-sm leading-[1.6] text-mut md:col-span-7'>{detail}</p>
    </li>
  ));
  const checkEls = deliverables.map((item) => (
    <li key={item} className={CHECK_ROW}>
      <Check aria-hidden='true' className='mt-[3px] size-4 shrink-0' />
      <span className='text-base leading-[1.5]'>{item}</span>
    </li>
  ));
  return (
    <Section variant='paper'>
      <div className='grid gap-y-14 lg:grid-cols-12 lg:gap-x-8'>
        <div className='flex flex-col gap-20 lg:col-span-9 lg:gap-28'>
          <Block {...blocks[0]}>
            <ul className='flex flex-col border-b-[1.5px] border-line'>{ledgerEls}</ul>
          </Block>
          <Block {...blocks[1]}>
            <Timeline steps={steps} />
          </Block>
          <Block {...blocks[2]}>
            <ul className='grid gap-x-10 border-b-[1.5px] border-line sm:grid-cols-2'>{checkEls}</ul>
          </Block>
        </div>
        <aside className='hidden lg:col-span-3 lg:block'>
          <div className='sticky top-[calc(var(--nav-rail)+2.5rem)] flex flex-col gap-8'>
            <nav aria-label={contents} className='flex flex-col gap-4'>
              <span className='font-mono text-[11px] uppercase tracking-[0.18em] text-mut'>{contents}</span>
              <ol className='flex flex-col'>{railEls}</ol>
            </nav>
            <a href={cta.href} className={CTA}>
              {cta.label}
            </a>
          </div>
        </aside>
      </div>
    </Section>
  );
}
