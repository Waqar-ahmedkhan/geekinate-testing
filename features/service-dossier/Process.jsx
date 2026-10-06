import { Section } from '@/components';
import { Cycle } from '@/lib/ui/reusable_components';

export default function Process({ block, steps }) {
  return (
    <Section id={block.id} variant='paper' className='scroll-mt-[var(--nav-rail)]'>
      <Cycle block={block} items={steps} />
    </Section>
  );
}
