import { Eyebrow, Section, StepIndex } from '@/components';
import Cta from '@/features/cta';
import { ContactForm, TypedHeading } from '@/lib/ui/reusable_components';
import { contactContent, services } from '@/lib/content';
import { SITE } from '@/constants';

export default function Contact({ topic = 'home' }) {
  const { eyebrow, pitches, steps, direct } = contactContent;
  const pitch = pitches[topic] ?? pitches.home;
  const { headings, intro } = pitch;
  const service = services.find(({ slug }) => slug === topic);
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
    <>
      <Cta />
      <Section id='contact' variant='paper' className='flex min-h-svh flex-col justify-center'>
        <div className='mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16'>
          <div className='flex flex-col gap-8 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
            <header className='flex flex-col gap-4'>
              <Eyebrow>{pitch.eyebrow ?? eyebrow}</Eyebrow>
              <TypedHeading
                phrases={headings}
                className='max-w-[15ch] font-display text-[clamp(2.5rem,5.4vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.01em]'
              />
              <p className='max-w-[46ch] text-base leading-[1.6] text-mut'>{intro}</p>
            </header>
            <ol className='flex flex-col gap-5 border-t-[1.5px] border-line pt-8'>{stepEls}</ol>
          </div>
          <ContactForm topic={service?.title} />
        </div>
        <div className='mx-auto mt-14 flex max-w-6xl flex-col items-center gap-3.5 text-center'>
          <Eyebrow>{direct.lead}</Eyebrow>
          <a
            href={`mailto:${SITE.email}`}
            className='font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-none text-foreground underline decoration-volt decoration-[3px] underline-offset-[7px] transition-[text-decoration-color] duration-200 hover:decoration-ink'
          >
            {SITE.email}
          </a>
        </div>
      </Section>
    </>
  );
}
