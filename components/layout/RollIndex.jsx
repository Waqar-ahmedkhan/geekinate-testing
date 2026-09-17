import Eyebrow from './Eyebrow';
import { cn } from '@/lib/utils';

const DIGIT = 'inline-block h-[1em] overflow-hidden';
const STRIP =
  'flex flex-col transition-transform duration-0 group-hover/lift:-translate-y-[10em] group-hover/lift:duration-[720ms] group-hover/lift:ease-[cubic-bezier(0.2,0.7,0.1,1)] motion-reduce:transition-none';
const GLYPH = 'block h-[1em] leading-[1em]';
const TURN = Array.from({ length: 11 }, (_, step) => step);

export default function RollIndex({ value }) {
  const digitEls = [...value].map((digit, place) => {
    const glyphEls = TURN.map((step) => (
      <span key={step} className={GLYPH}>
        {(Number(digit) + step) % 10}
      </span>
    ));
    return (
      <span key={place} className={DIGIT}>
        <span className={cn(STRIP, place > 0 && 'group-hover/lift:delay-[70ms]')}>{glyphEls}</span>
      </span>
    );
  });
  return (
    <Eyebrow className='transition-colors duration-[260ms] group-hover/lift:text-volt'>
      <span className='sr-only'>{value}</span>
      <span aria-hidden='true' className='inline-flex'>
        {digitEls}
      </span>
    </Eyebrow>
  );
}
