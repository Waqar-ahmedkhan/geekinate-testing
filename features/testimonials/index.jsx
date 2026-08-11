import { Eyebrow, Section } from '@/components';
import { TestimonialMarquee } from '@/lib/ui/reusable_components';
import { testimonials, testimonialsContent } from '@/lib/content';

// Section 04, on paper so it alternates against the transparent services block above it, and so the particle scene is hidden
// behind it rather than drifting under twelve cards of body copy. The head is centred with a volt asterisk and a
// mono footnote under it, which is the reference's device and the reason this does not reuse SectionHead — that primitive is the
// left-aligned pattern with a grey body paragraph, and bending it to centre plus accent plus footnote would cost more than it saves.
//
// The row is full-bleed: it drifts past both edges, so the section drops the horizontal gutter and the head carries its own.
export default function Testimonials() {
  const { eyebrow, heading, footnote } = testimonialsContent;
  return (
    <Section id='testimonials' variant='paper' className='px-0 md:px-0'>
      <header className='mb-12 flex flex-col items-center gap-2.5 px-6 text-center md:px-10'>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className='font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.01em]'>
          {heading}
          <span className='text-volt'>*</span>
        </h2>
        <p className='font-mono text-xs uppercase tracking-[0.18em] text-volt'>{footnote}</p>
      </header>
      <TestimonialMarquee items={testimonials} />
    </Section>
  );
}
