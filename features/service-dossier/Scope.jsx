import { DeckCard, Eyebrow, Section, SectionHead } from '@/components';
import { orderLabel } from '@/lib/utils';

const WIPE = 'duration-[460ms] ease-brutal motion-reduce:transition-none';
const MARK = `-mx-1 bg-[linear-gradient(var(--volt),var(--volt))] bg-[length:0%_100%] bg-left bg-no-repeat transition-[background-size] ${WIPE} group-hover/deck:bg-[length:100%_100%]`;
const TITLE = `px-1 bg-[linear-gradient(90deg,var(--ink)_50%,var(--volt)_50%)] bg-[length:200%_100%] bg-right bg-clip-text text-transparent transition-[background-position] ${WIPE} group-hover/deck:bg-left`;

export default function Scope({ block, intro, items }) {
  const cardEls = items.map(({ title, detail }, index) => (
    <DeckCard key={title} onPaper>
      <Eyebrow>{orderLabel(index)}</Eyebrow>
      <h3 className='text-xl leading-tight tracking-[-0.01em]'>
        <span className={MARK}>
          <span className={TITLE}>{title}</span>
        </span>
      </h3>
      <p className='text-sm leading-[1.6] text-mut'>{detail}</p>
    </DeckCard>
  ));
  return (
    <Section id={block.id} variant='paper' className='scroll-mt-[var(--nav-rail)]'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <SectionHead eyebrow={block.label} heading={block.heading} body={intro} />
        <div className='grid gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3'>{cardEls}</div>
      </div>
    </Section>
  );
}
