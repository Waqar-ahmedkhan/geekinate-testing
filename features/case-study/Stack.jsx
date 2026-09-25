import { Eyebrow, Section } from '@/components';
import { Marquee } from '@/lib/ui/reusable_components';

const ITEM = 'flex items-center gap-3 whitespace-nowrap font-mono text-sm uppercase tracking-[0.16em] text-paper md:text-base';

export default function Stack({ block, items }) {
  const itemEls = items.map((item) => (
    <span key={item} className={ITEM}>
      <span aria-hidden='true' className='size-2 bg-volt' />
      {item}
    </span>
  ));
  return (
    <Section id={block.id} variant='ink' compact className='py-7 md:py-9'>
      <div className='mx-auto flex w-full max-w-6xl flex-col items-start gap-4 md:flex-row md:items-center md:gap-12'>
        <Eyebrow className='shrink-0'>{block.label}</Eyebrow>
        <div className='w-full min-w-0 md:flex-1'>
          <Marquee gap={64}>{itemEls}</Marquee>
        </div>
      </div>
    </Section>
  );
}
