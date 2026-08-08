import Eyebrow from './Eyebrow';
import { cn } from '@/lib/utils';

// The muted greys are tuned for paper. On an ink section they fall to near-invisible, so tone swaps them for paper at low alpha.
const tones = {
  light: { eyebrow: 'text-grey', body: 'text-grey' },
  dark: { eyebrow: 'text-paper/50', body: 'text-paper/70' },
};

export default function SectionHead({ as: Heading = 'h2', tone = 'light', eyebrow, heading, body, className }) {
  const palette = tones[tone];
  const eyebrowEl = eyebrow ? <Eyebrow className={palette.eyebrow}>{eyebrow}</Eyebrow> : null;
  const bodyEl = body ? <p className={cn('max-w-[62ch] text-base leading-[1.6]', palette.body)}>{body}</p> : null;
  return (
    <header className={cn('mb-8 flex flex-col gap-3 md:mb-10', className)}>
      {eyebrowEl}
      <Heading className='max-w-[22ch] text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]'>{heading}</Heading>
      {bodyEl}
    </header>
  );
}
