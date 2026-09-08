import { Actions, PageHero } from '@/components';
import { servicePageContent } from '@/lib/content';

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
      actions={<Actions items={actions} className='mt-2 justify-center' />}
      proof={proof}
    />
  );
}
