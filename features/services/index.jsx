import { Section, SectionHead } from '@/components';
import { HoverVideoCard } from '@/lib/ui/reusable_components';
import { services, servicesContent } from '@/lib/content';

export default function Services() {
  const { eyebrow, heading, body } = servicesContent;
  return (
    <Section id='services' variant='ink'>
      <SectionHead tone='dark' eyebrow={eyebrow} heading={heading} body={body} />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {services.map(({ slug, title, summary, media }) => (
          <HoverVideoCard key={slug} title={title} summary={summary} media={media} />
        ))}
      </div>
    </Section>
  );
}
