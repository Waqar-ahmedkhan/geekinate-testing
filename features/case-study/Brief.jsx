import { Eyebrow, Section } from '@/components';
import { orderLabel } from '@/lib/utils';

const HEADING = 'font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em] text-foreground';
const ROW = 'grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-t-[1.5px] border-line py-5';
const INDEX = 'pt-1 font-mono text-xs text-mut';
const POINT = 'text-base leading-[1.6] text-foreground md:text-lg';

export default function Brief({ block, brief }) {
  const partEls = block.parts.map(({ id, label, heading }) => {
    const pointEls = brief[id].map((point, index) => (
      <li key={point} className={ROW}>
        <span className={INDEX}>{orderLabel(index)}</span>
        <p className={POINT}>{point}</p>
      </li>
    ));
    return (
      <div key={id} className='flex flex-col gap-8'>
        <header className='flex flex-col gap-4'>
          <Eyebrow>{label}</Eyebrow>
          <h2 className={HEADING}>{heading}</h2>
        </header>
        <ol className='border-b-[1.5px] border-line'>{pointEls}</ol>
      </div>
    );
  });
  return (
    <Section id={block.id} variant='paper' compact className='scroll-mt-[var(--nav-rail)] py-24 md:py-32'>
      <div className='mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2 lg:gap-20 [&>*]:min-w-0'>{partEls}</div>
    </Section>
  );
}
