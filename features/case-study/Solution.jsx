import { Section } from '@/components';
import { Cycle } from '@/lib/ui/reusable_components';

export default function Solution({ block, points }) {
  return (
    <Section id={block.id} variant='ink' compact className='scroll-mt-[var(--nav-rail)] py-24 md:py-32'>
      <Cycle block={block} items={points} />
    </Section>
  );
}
