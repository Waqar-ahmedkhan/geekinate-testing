import { Eyebrow, Section } from '@/components';
import { cn } from '@/lib/utils';
import { legalContent } from '@/lib/content';

const HEADLINE = 'font-display text-[clamp(2.6rem,5.4vw,5rem)] italic leading-[1.04] tracking-[-0.01em] text-paper';
const HEADING = 'font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.01em] text-ink';
const TEXT = 'text-base leading-[1.7] text-mut md:text-lg';
const EMAIL =
  'w-fit font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-none text-ink underline decoration-volt decoration-[3px] underline-offset-[7px] transition-[text-decoration-color] duration-200 hover:decoration-ink';

const LegalSection = ({ heading, body = [], list = [], email }) => {
  const bodyEls = body.map((line) => (
    <p key={line} className={TEXT}>
      {line}
    </p>
  ));
  const itemEls = list.map((item) => <li key={item}>{item}</li>);
  const listEl = list.length ? <ul className={cn('flex list-disc flex-col gap-2 pl-5 marker:text-ink', TEXT)}>{itemEls}</ul> : null;
  const emailEl = email ? (
    <a href={`mailto:${email}`} className={EMAIL}>
      {email}
    </a>
  ) : null;
  return (
    <section className='flex flex-col gap-4 border-t-[1.5px] border-line pt-8'>
      <h2 className={HEADING}>{heading}</h2>
      {bodyEls}
      {listEl}
      {emailEl}
    </section>
  );
};

export default function Legal({ page }) {
  const { eyebrow, updatedLabel } = legalContent;
  const { title, updated, intro, sections } = page;
  const sectionEls = sections.map((section) => <LegalSection key={section.heading} {...section} />);
  return (
    <main className='flex-1'>
      <Section
        variant='clear'
        className='-mt-[var(--nav-rail)] pb-14 pt-[calc(var(--nav-rail)+4rem)] md:pb-20 md:pt-[calc(var(--nav-rail)+6rem)]'
      >
        <div className='mx-auto flex max-w-3xl flex-col gap-6'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className={HEADLINE}>{title}</h1>
          <p className='font-mono text-xs uppercase tracking-[0.14em] text-mut'>
            {updatedLabel} {updated}
          </p>
        </div>
      </Section>
      <Section variant='paper'>
        <div className='mx-auto flex max-w-3xl flex-col gap-12'>
          <p className='text-lg leading-[1.6] text-ink md:text-xl'>{intro}</p>
          {sectionEls}
        </div>
      </Section>
    </main>
  );
}
