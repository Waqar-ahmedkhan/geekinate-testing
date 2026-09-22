import Cycle from './Cycle';
import { Section } from '@/components';

export default function Process({ block, steps }) {
  return (
    <Section id={block.id} variant='paper' className='scroll-mt-[var(--nav-rail)]'>
      <Cycle block={block} items={steps} />
    </Section>
  );
}
