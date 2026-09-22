import Clip from './Clip';
import { Actions, PageHero } from '@/components';
import { Guide } from '@/lib/ui/reusable_components';
import { guidedServices, servicePageContent } from '@/lib/content';
import { SERVICE_CLIPS, SERVICE_SHAPES } from '@/constants';

const SHAPE_SLOT = 'mx-auto aspect-square w-full max-w-sm lg:max-w-none';

const heroAside = ({ slug, media }) => {
  if (guidedServices.includes(slug)) return <Guide />;
  if (SERVICE_CLIPS.includes(slug)) return <Clip media={media} />;
  const shape = SERVICE_SHAPES[slug];
  return shape ? <div data-cosmos-shape={shape} aria-hidden='true' className={SHAPE_SLOT} /> : null;
};

export default function ServiceHero({ service }) {
  const { title, headline, lead, facts } = service;
  const { actions } = servicePageContent;
  const headlineEl = (
    <>
      {headline.lead} <span className='text-volt'>{headline.mark}</span> {headline.trail}
    </>
  );
  const proof = facts.map(({ label, value }) => `${label} — ${value}`);
  return (
    <PageHero
      id='hero-service'
      eyebrow={title}
      headline={headlineEl}
      measure='max-w-[22ch]'
      support={[lead]}
      actions={<Actions items={actions} className='mt-2' />}
      aside={heroAside(service)}
      proof={proof}
    />
  );
}
