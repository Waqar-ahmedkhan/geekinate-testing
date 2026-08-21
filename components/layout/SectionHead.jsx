import Eyebrow from './Eyebrow';
import { cn } from '@/lib/utils';

export default function SectionHead({ as: Heading = 'h2', eyebrow, heading, body, className }) {
  const eyebrowEl = eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null;
  const bodyEl = body ? <p className='max-w-[62ch] text-base leading-[1.6] text-mut'>{body}</p> : null;
  return (
    <header className={cn('mb-8 flex flex-col gap-3 md:mb-10', className)}>
      {eyebrowEl}
      <Heading className='max-w-[24ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.01em]'>
        {heading}
      </Heading>
      {bodyEl}
    </header>
  );
}
