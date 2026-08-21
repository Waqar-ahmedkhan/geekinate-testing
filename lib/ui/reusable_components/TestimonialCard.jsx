import { cn } from '@/lib/utils';

const initialsOf = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('');

export default function TestimonialCard({ quote, name, role, className }) {
  const initials = initialsOf(name);
  return (
    <figure
      className={cn(
        'group flex w-[280px] shrink-0 flex-col gap-6 rounded-[14px] bg-black p-6 transition-colors duration-300 ease-brutal hover:bg-volt sm:w-[370px] sm:gap-8 sm:p-8',
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
