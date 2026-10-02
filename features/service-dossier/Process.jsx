import { Section } from '@/components';
import { Cycle } from '@/lib/ui/reusable_components';

export default function Process({ block, steps }) {
  return (
    <Section id={block.id} variant='paper' compact className='scroll-mt-[var(--nav-rail)] pb-0 md:pb-0'>
      <Cycle block={block} items={steps} />
    </Section>
  );
}
