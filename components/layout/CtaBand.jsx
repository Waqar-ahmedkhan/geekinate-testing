import Actions from './Actions';
import Section from './Section';

export default function CtaBand({ headline, actions, link, meta }) {
  return (
    <Section variant='ink' className='py-24 md:py-32'>
      <div className='mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center'>
        <h2 className='text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-paper'>
          {headline.lead} <span className='text-volt'>{headline.trail}</span>
        </h2>
        <Actions items={actions} link={link} meta={meta} className='justify-center' />
      </div>
    </Section>
  );
}
