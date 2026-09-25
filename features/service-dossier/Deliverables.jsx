import { Section } from '@/components';
import { Cycle } from '@/lib/ui/reusable_components';

export default function Deliverables({ block, items }) {
  return (
    <Section id={block.id} variant='ink' className='scroll-mt-[var(--nav-rail)]'>
      <Cycle block={block} items={items} mirror />
    </Section>
  );
}
