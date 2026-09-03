import { Section, SectionHead } from '@/components';
import { HoverVideoCard, NodeGraphBoard } from '@/lib/ui/reusable_components';
import { services, servicesContent } from '@/lib/content';

const VISUALS = { nodeGraph: <NodeGraphBoard /> };

export default function Services() {
  const { eyebrow, heading, body } = servicesContent;
  return (
    <Section id='services' variant='ink'>
      <SectionHead eyebrow={eyebrow} heading={heading} body={body} />
      <div className='grid gap-4 md:grid-cols-3'>
        {services.map(({ slug, title, summary, media, visual }) => (
          <HoverVideoCard key={slug} title={title} summary={summary} media={media} visual={VISUALS[visual]} />
        ))}
      </div>
    </Section>
  );
}
