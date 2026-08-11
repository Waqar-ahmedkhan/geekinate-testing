import Eyebrow from './Eyebrow';
import { cn } from '@/lib/utils';

// The tone prop is gone. It existed to swap grey type for paper-at-low-alpha on dark sections, and `.on-paper` in globals.css now
// does that for every muted colour on the page at once — a head on a paper section and a head on a dark one differ by which section
// they are inside, not by a prop somebody has to remember to pass.
export default function SectionHead({ as: Heading = 'h2', eyebrow, heading, body, className }) {
  const eyebrowEl = eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null;
  const bodyEl = body ? <p className='max-w-[62ch] text-base leading-[1.6] text-mut'>{body}</p> : null;
  return (
    <header className={cn('mb-8 flex flex-col gap-3 md:mb-10', className)}>
      {eyebrowEl}
      {/* Serif, upright, and at 400 — the display face carries section headings the way the reference does. The hero is the only
          place it sets italic; using italic everywhere spends the emphasis it exists to provide. */}
      <Heading className='max-w-[24ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.01em]'>
        {heading}
      </Heading>
      {bodyEl}
    </header>
  );
}
