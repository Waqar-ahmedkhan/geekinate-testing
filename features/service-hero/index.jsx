import { Actions, PageHero } from '@/components';
import { Guide } from '@/lib/ui/reusable_components';
import { servicePageContent, serviceBlueprints } from '@/lib/content';

export default function ServiceHero({ service }) {
  const { slug, title, headline, lead, facts } = service;
  const { actions } = servicePageContent;
  const headlineEl = (
    <>
      {headline.lead} <span className='text-volt'>{headline.mark}</span> {headline.trail}
    </>
  );
  const proof = facts.map(({ label, value }) => `${label} — ${value}`);
  const aside = serviceBlueprints[slug] ? <Guide /> : null;
  return (
    <PageHero
      id='hero-service'
      eyebrow={title}
      headline={headlineEl}
      measure='max-w-[22ch]'
      support={[lead]}
      actions={<Actions items={actions} className='mt-2' />}
      aside={aside}
      proof={proof}
    />
  );
}
