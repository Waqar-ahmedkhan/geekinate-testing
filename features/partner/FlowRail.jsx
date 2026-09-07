import { Eyebrow } from '@/components';
import { partnerHero } from '@/lib/content';

const STEP_INDEX = 'flex size-8 shrink-0 items-center justify-center rounded-full border-brutal bg-void font-mono text-[11px] text-mut';

export default function FlowRail() {
  const { label, steps } = partnerHero.flow;
  const stepEls = steps.map(({ title }, index) => (
    <li key={title} className='relative flex items-center gap-4'>
      <span aria-hidden='true' className={STEP_INDEX}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className='text-lg leading-tight text-paper'>{title}</span>
    </li>
  ));
  return (
    <div className='border-volt glass relative flex flex-col gap-6 rounded-lg p-6 shadow-brutal md:p-8'>
      <Eyebrow>{label}</Eyebrow>
      <div className='relative'>
        <span aria-hidden='true' className='absolute inset-y-4 left-4 w-px bg-[var(--line-volt)]' />
        <span aria-hidden='true' className='pointer-events-none absolute inset-y-4 left-4 w-px motion-reduce:hidden'>
          <span className='animate-rail-run absolute -left-[3px] size-[7px] rounded-full bg-volt' />
        </span>
        <ol className='relative flex flex-col gap-5'>{stepEls}</ol>
      </div>
    </div>
  );
}
