import { Eyebrow, StepIndex } from '@/components';
import { partnerHero } from '@/lib/content';

export default function FlowRail() {
  const { label, steps } = partnerHero.flow;
  const stepEls = steps.map(({ title }, index) => (
    <li key={title} className='relative flex items-center gap-4'>
      <StepIndex value={index + 1} />
      <span className='text-lg leading-tight text-paper'>{title}</span>
    </li>
  ));
  return (
    <div className='border-volt glass relative flex flex-col gap-6 rounded-lg p-6 shadow-brutal md:p-8'>
      <Eyebrow>{label}</Eyebrow>
      <div className='relative'>
        <span aria-hidden='true' className='absolute inset-y-4 left-[18px] w-px bg-[var(--line-volt)]' />
        <span aria-hidden='true' className='pointer-events-none absolute inset-y-4 left-[18px] w-px motion-reduce:hidden'>
          <span className='animate-rail-run absolute -left-[3px] size-[7px] rounded-full bg-volt' />
        </span>
        <ol className='relative flex flex-col gap-5'>{stepEls}</ol>
      </div>
    </div>
  );
}
