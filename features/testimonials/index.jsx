import { Eyebrow, Section } from '@/components';
import { TestimonialMarquee } from '@/lib/ui/reusable_components';
import { testimonials, testimonialsContent } from '@/lib/content';

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
