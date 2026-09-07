import { Section, StepIndex } from '@/components';
import { partnerIdea } from '@/lib/content';

export default function CoreIdea() {
  const { heading, intro, cases, closing } = partnerIdea;
  const [lead, punch] = closing;
  const caseEls = cases.map((line, index) => (
    <li key={line} className='flex gap-5 border-t-[1.5px] border-line py-4'>
      <StepIndex value={index + 1} />
      <span className='text-base leading-[1.5] text-ink-soft'>{line}</span>
    </li>
  ));
  return (
    <Section variant='paper'>
      <div className='mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16'>
        <div className='flex flex-col gap-10'>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{heading}</h2>
          <div className='flex flex-col items-start gap-3 border-l-[1.5px] border-ink pl-6'>
            <p className='font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.15] tracking-[-0.01em] text-ink-soft'>{lead}</p>
            <p className='font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.15] tracking-[-0.01em] text-ink'>
              <span className='text-marker'>{punch}</span>
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-5'>
          <p className='max-w-[42ch] text-base leading-[1.6] text-mut'>{intro}</p>
          <ol className='flex flex-col border-b-[1.5px] border-line'>{caseEls}</ol>
        </div>
      </div>
    </Section>
  );
}
