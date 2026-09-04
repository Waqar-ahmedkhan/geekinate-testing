import { Eyebrow, Section, StepIndex } from '@/components';
import { ContactForm } from '@/lib/ui/reusable_components';
import { cn } from '@/lib/utils';
import { contactContent } from '@/lib/content';
import { SITE } from '@/constants';

export default function Contact({ className }) {
  const { eyebrow, heading, intro, availability, steps, direct } = contactContent;
  const stepEls = steps.map(({ title, detail }, index) => (
    <li key={title} className='flex gap-4'>
      <StepIndex value={index + 1} />
      <span className='flex flex-col gap-1'>
        <span className='text-base leading-tight text-foreground'>{title}</span>
        <span className='text-sm leading-[1.5] text-mut'>{detail}</span>
      </span>
    </li>
  ));
  return (
    <Section id='contact' variant='paper'>
      <div className={cn('mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16', className)}>
        <div className='flex flex-col gap-8 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <header className='flex flex-col gap-4'>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className='max-w-[15ch] font-display text-[clamp(2.5rem,5.4vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.01em]'>
              {heading}
            </h2>
            <p className='max-w-[46ch] text-base leading-[1.6] text-mut'>{intro}</p>
          </header>
          <span className='border-brutal flex w-fit items-center gap-2.5 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] shadow-brutal-sm'>
            <span className='relative flex size-2'>
              <span className='absolute inline-flex size-full animate-ping rounded-full bg-volt opacity-70 motion-reduce:hidden' />
              <span className='relative inline-flex size-2 rounded-full bg-volt' />
            </span>
            {availability}
          </span>
          <ol className='flex flex-col gap-5 border-t-[1.5px] border-line pt-8'>{stepEls}</ol>
          <div className='flex flex-col gap-1.5'>
            <span className='font-mono text-[11px] uppercase tracking-[0.14em] text-mut'>{direct.label}</span>
            <a
              href={`mailto:${SITE.email}`}
              className='w-fit font-display text-2xl leading-none underline decoration-volt decoration-[3px] underline-offset-[7px] transition-[text-decoration-color] duration-200 hover:decoration-ink'
            >
              {SITE.email}
            </a>
          </div>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
