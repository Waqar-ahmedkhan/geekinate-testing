import { Eyebrow, Section } from '@/components';
import { TestimonialMarquee } from '@/lib/ui/reusable_components';
import { testimonials, testimonialsContent } from '@/lib/content';

// Section 04, on white so it alternates against the black services block above it. The head is centred with a volt asterisk and a
// mono footnote under it, which is the reference's device and the reason this does not reuse SectionHead — that primitive is the
// left-aligned pattern with a grey body paragraph, and bending it to centre plus accent plus footnote would cost more than it saves.
//
// The row is full-bleed: it drifts past both edges, so the section drops the horizontal gutter and the head carries its own.
export default function Testimonials() {
  const { eyebrow, heading, footnote } = testimonialsContent;
  return (
    <Section id='testimonials' className='px-0 md:px-0'>
      <header className='mb-12 flex flex-col items-center gap-2.5 px-6 text-center md:px-10'>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className='text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]'>
          {heading}
          <span className='text-volt'>*</span>
        </h2>
        <p className='font-mono text-xs uppercase tracking-[0.18em] text-volt'>{footnote}</p>
      </header>
      <TestimonialMarquee items={testimonials} />
    </Section>
  );
}
