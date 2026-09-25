import { ArrowUpRight } from 'lucide-react';
import { Actions, Eyebrow, Section } from '@/components';

const STATEMENT = 'max-w-[17ch] text-balance font-display text-[clamp(2.4rem,4.8vw,4.25rem)] leading-[1.02] tracking-[-0.01em]';
const ROW = 'flex items-baseline justify-between gap-6 border-b-[1.5px] border-line py-3.5';
const LABEL = 'text-sm text-mut';
const VALUE = 'text-right text-base text-foreground';
const VISIT =
  'group inline-flex items-center gap-1 underline decoration-volt decoration-2 underline-offset-[5px] transition-[text-decoration-color] duration-200 hover:decoration-ink';

const hostOf = (url) => new URL(url).hostname.replace(/^www\./, '');

export default function Intro({ block, visit, project, actions }) {
  const { headline, summary, facts, disciplines, url } = project;
  const rows = [...facts, { label: block.service, value: disciplines.join(', ') }];
  const rowEls = rows.map(({ label, value }) => (
    <div key={label} className={ROW}>
      <dt className={LABEL}>{label}</dt>
      <dd className={VALUE}>{value}</dd>
    </div>
  ));
  const visitEl = url ? (
    <div className={ROW}>
      <dt className={LABEL}>{visit}</dt>
      <dd className={VALUE}>
        <a href={url} target='_blank' rel='noopener noreferrer' className={VISIT}>
          {hostOf(url)}
          <ArrowUpRight className='size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
        </a>
      </dd>
    </div>
  ) : null;
  return (
    <Section id={block.id} variant='paper' compact className='pt-8 pb-24 md:pt-12 md:pb-32'>
      <div className='mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[7fr_5fr] lg:gap-20'>
        <div className='flex flex-col gap-6'>
          <Eyebrow>{block.label}</Eyebrow>
          <h2 className={STATEMENT}>
            {headline.lead} <em className='italic'>{headline.mark}</em>
          </h2>
        </div>
        <div className='flex flex-col items-start gap-8 lg:pt-10'>
          <p className='max-w-[44ch] text-lg leading-[1.6] text-ink-soft'>{summary}</p>
          <dl className='w-full border-t-[1.5px] border-line'>
            {rowEls}
            {visitEl}
          </dl>
          <Actions items={actions} />
        </div>
      </div>
    </Section>
  );
}
