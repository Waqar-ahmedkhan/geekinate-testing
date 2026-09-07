import { Check, Minus } from 'lucide-react';
import Card from './Card';
import { Eyebrow, Section } from '@/components';
import { cn } from '@/lib/utils';
import { partnerQualification } from '@/lib/content';

const MARKERS = { good: Check, bad: Minus };
const MARKER_TONES = { good: 'border-transparent bg-volt text-ink', bad: 'border-line bg-transparent text-mut' };

export default function Qualification() {
  const { eyebrow, columns } = partnerQualification;
  const columnEls = columns.map(({ heading, tone, items, closing }) => {
    const Marker = MARKERS[tone];
    return (
      <Card key={heading} onPaper className='gap-5'>
        <h3 className='max-w-[20ch] font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.01em] text-foreground'>
          {heading}
        </h3>
        <ul className='flex flex-col gap-3'>
          {items.map((item) => (
            <li key={item} className='flex gap-3 text-sm leading-[1.5] text-mut'>
              <span
                aria-hidden='true'
                className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px]', MARKER_TONES[tone])}
              >
                <Marker className='size-3' />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className='mt-auto border-t-[1.5px] border-line pt-5 text-base leading-[1.5] text-foreground'>{closing}</p>
      </Card>
    );
  });
  return (
    <Section variant='paper'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
        <Eyebrow className='text-grey'>{eyebrow}</Eyebrow>
        <div className='grid gap-4 md:grid-cols-2'>{columnEls}</div>
      </div>
    </Section>
  );
}
