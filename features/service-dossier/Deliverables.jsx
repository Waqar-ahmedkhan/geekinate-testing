import Cycle from './Cycle';
import { Section } from '@/components';

export default function Deliverables({ block, items }) {
  return (
    <Section id={block.id} variant='ink' className='scroll-mt-[var(--nav-rail)]'>
      <Cycle block={block} items={items} mirror />
    </Section>
  );
}
