import FlowRail from './FlowRail';
import TrackedLink from './Track';
import { Actions, PageHero } from '@/components';
import { partnerHero } from '@/lib/content';

const heroMeta = ({ label, intent }) => ({ location: 'hero', label, intent });

export default function Hero() {
  const { eyebrow, headline, support, actions, proof } = partnerHero;
  const headlineEl = (
    <>
      {headline.lead} <span className='text-volt'>{headline.trail}</span>
    </>
  );
  const actionsEl = <Actions items={actions} link={TrackedLink} meta={heroMeta} className='mt-2' />;
  return (
    <PageHero
      id='hero-partner'
      eyebrow={eyebrow}
      headline={headlineEl}
      support={support}
      actions={actionsEl}
      aside={<FlowRail />}
      proof={proof}
    />
  );
}
