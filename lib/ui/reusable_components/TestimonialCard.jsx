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
    // Black card on the white section, which is the reference's own arrangement — not a glass card with an ink rule. It was briefly
    // rebuilt as glass when the site moved to the dark ground, and that was wrong: this block is a measured reconstruction of
    // wearestokt.com and its contrast runs the other way to everything around it on purpose.
    // Hover flips the whole card to volt. The avatar inverts with it rather than staying volt-on-volt, which would erase the initials
    // at exactly the moment the card is being looked at.
    <figure
      className={cn(
        'group flex w-[370px] shrink-0 flex-col gap-8 rounded-[14px] bg-black p-8 transition-colors duration-300 ease-brutal hover:bg-volt',
        className
      )}
    >
      <blockquote className='text-lg leading-[1.3] text-paper transition-colors duration-300 group-hover:text-ink'>{quote}</blockquote>
      <figcaption className='flex items-start gap-4'>
        <span className='flex size-[46px] shrink-0 items-center justify-center rounded-full bg-volt font-mono text-sm text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-volt'>
          {initials}
        </span>
        <div className='flex flex-1 items-start gap-3'>
          <div className='flex flex-1 flex-col gap-1.5'>
            <span className='text-base leading-[1.1] tracking-[-0.02em] text-paper transition-colors duration-300 group-hover:text-ink'>
              {name}
            </span>
            <span className='font-mono text-[10px] leading-[1.3] uppercase tracking-[-0.02em] text-paper/45 transition-colors duration-300 group-hover:text-ink/60'>
              {role}
            </span>
          </div>
          <span
            aria-hidden='true'
            className='-mt-3 font-sans text-[56px] leading-none text-paper/10 transition-colors duration-300 group-hover:text-ink/20'
          >
            &rdquo;
          </span>
        </div>
      </figcaption>
    </figure>
  );
}
