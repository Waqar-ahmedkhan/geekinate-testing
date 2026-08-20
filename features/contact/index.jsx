import { Eyebrow, Section } from '@/components';
import { ContactForm } from '@/lib/ui/reusable_components';
import { contactContent } from '@/lib/content';

// Section 05, and the anchor three separate controls have been pointing at since the site was assembled: the hero's primary action,
// the navbar's call to action and the navbar's Contact link all target `#contact`, and until this existed all three did nothing.
//
// Centred rather than left aligned, which is why it does not reuse SectionHead. That primitive is the left aligned pattern with a
// grey body paragraph, and Testimonials above it declined it for the same reason. Upright display, not italic: the hero is the only
// place on this site that sets the display face italic, and spending that emphasis again here takes it away from the hero.
//
// Paper, so the page still arrives at the footer by going dark. A dark section here would merge with the footer's own panel sixteen
// pixels below it, and that panel would read as a stray rounded rectangle inside one large dark area rather than as the last screen.
//
// The measure cap is on the form alone and is not the container primitive that was removed on 2026-08-07. Sections here are full
// width by decision; a form is not, because a text input that runs the width of a 1920 monitor is unreadable and an ask nobody
// finishes. The header above it is capped the same way every heading on the site is, by ch.
export default function Contact() {
  const { eyebrow, heading } = contactContent;
  return (
    <Section id='contact' variant='paper'>
      <div className='mx-auto flex w-full max-w-3xl flex-col'>
        <header className='flex flex-col items-center gap-3 text-center'>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className='max-w-[20ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[1.05] tracking-[-0.01em]'>
            {heading}
          </h2>
        </header>
        <div className='mt-10 md:mt-14'>
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
