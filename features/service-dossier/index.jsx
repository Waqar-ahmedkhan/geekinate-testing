import Deliverables from './Deliverables';
import Process from './Process';
import Scope from './Scope';
import { servicePageContent } from '@/lib/content';
import { DICE_SCOPES, SERVICE_SECTIONS } from '@/constants';

const blocks = Object.fromEntries(servicePageContent.blocks.map((block) => [block.id, block]));

export default function ServiceDossier({ service }) {
  const { slug, scope, scopeIntro, steps, deliverables } = service;
  const dice = DICE_SCOPES.includes(slug);
  return (
    <>
      <Scope block={blocks[SERVICE_SECTIONS.scope]} intro={scopeIntro} items={scope} dice={dice} />
      <Deliverables block={blocks[SERVICE_SECTIONS.deliverables]} items={deliverables} />
      <Process block={blocks[SERVICE_SECTIONS.process]} steps={steps} />
    </>
  );
}
