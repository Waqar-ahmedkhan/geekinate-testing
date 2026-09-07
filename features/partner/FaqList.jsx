'use client';

import { useRef } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { track } from '@/lib/analytics';
import { PARTNER_EVENTS } from '@/constants';

const TRIGGER = 'border-b-0 py-5 text-lg leading-tight tracking-[-0.01em] text-ink hover:no-underline hover:text-grey';

const slugFor = (question) =>
  question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function FaqList({ items }) {
  const openRef = useRef([]);
  const report = (open) => {
    const opened = open.filter((value) => !openRef.current.includes(value));
    const closed = openRef.current.filter((value) => !open.includes(value));
    openRef.current = open;
    const slugOf = (value) => slugFor(items[Number(value.split('-')[1])].question);
    opened.forEach((value) => track(PARTNER_EVENTS.faqToggle, { question_slug: slugOf(value), state: 'open' }));
    closed.forEach((value) => track(PARTNER_EVENTS.faqToggle, { question_slug: slugOf(value), state: 'closed' }));
  };
  const itemEls = items.map(({ question, answer }, index) => (
    <AccordionItem key={question} value={`faq-${index}`} className='border-b-[1.5px] border-line'>
      <AccordionTrigger className={TRIGGER}>{question}</AccordionTrigger>
      <AccordionContent className='max-w-[70ch] pb-6 text-base leading-[1.6] text-ink-soft'>{answer}</AccordionContent>
    </AccordionItem>
  ));
  return (
    <Accordion type='multiple' onValueChange={report} className='border-t-[1.5px] border-line'>
      {itemEls}
    </Accordion>
  );
}
