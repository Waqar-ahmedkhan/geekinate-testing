import Steps from './Steps';
import { Eyebrow, Section } from '@/components';

export default function Process({ block, steps }) {
  return (
    <Section id={block.id} variant='paper' className='scroll-mt-[var(--nav-rail)]'>
      <Steps steps={steps}>
        <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <Eyebrow>{block.label}</Eyebrow>
          <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{block.heading}</h2>
        </header>
      </Steps>
    </Section>
  );
}
