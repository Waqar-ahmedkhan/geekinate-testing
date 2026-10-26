import Actions from './Actions';
import Section from './Section';

export default function CtaBand({ headline, actions, link, meta }) {
  return (
    <Section variant='ink' compact className='py-24 md:py-32'>
      <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center'>
        <h2 className='font-display text-[clamp(2.25rem,5.4vw,4rem)] leading-[1.05] tracking-[-0.01em] text-paper'>
          {headline.lead} <span className='block text-volt'>{headline.trail}</span>
        </h2>
        <Actions items={actions} link={link} meta={meta} className='justify-center' />
      </div>
    </Section>
  );
}
