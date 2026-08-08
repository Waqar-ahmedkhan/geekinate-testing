import { cn } from '@/lib/utils';

// Transcribed from wearestokt.com: 370px wide, 14px radius, 32px of padding, 32px between the quote and the attribution row, and
// the attribution row itself is avatar / name+role / quote glyph at 16px. The glyph is deliberately near-invisible — it is texture
// in the corner, not a mark to read.
//
// No headshots exist yet, so the avatar is the speaker's initials rather than stock faces standing in for real clients.
const initialsOf = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('');

export default function TestimonialCard({ quote, name, role, className }) {
  const initials = initialsOf(name);
  return (
    <figure className={cn('flex w-[370px] shrink-0 flex-col gap-8 rounded-[14px] bg-black p-8', className)}>
      <blockquote className='text-lg leading-[1.3] text-paper'>{quote}</blockquote>
      <figcaption className='flex items-start gap-4'>
        <span className='flex size-[46px] shrink-0 items-center justify-center rounded-full bg-volt font-mono text-sm text-ink'>
          {initials}
        </span>
        <div className='flex flex-1 items-start gap-3'>
          <div className='flex flex-1 flex-col gap-1.5'>
            <span className='text-base leading-[1.1] tracking-[-0.02em] text-paper'>{name}</span>
            <span className='font-mono text-[10px] leading-[1.3] uppercase tracking-[-0.02em] text-paper/45'>{role}</span>
          </div>
          <span aria-hidden='true' className='-mt-3 font-sans text-[56px] leading-none text-paper/10'>
            &rdquo;
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
