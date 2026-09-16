import Deliverables from './Deliverables';
import Process from './Process';
import Scope from './Scope';
import { servicePageContent } from '@/lib/content';
import { SERVICE_SECTIONS } from '@/constants';

const blocks = Object.fromEntries(servicePageContent.blocks.map((block) => [block.id, block]));

export default function ServiceDossier({ service }) {
  const { scope, scopeIntro, steps, deliverables } = service;
  return (
    <>
      <Scope block={blocks[SERVICE_SECTIONS.scope]} intro={scopeIntro} items={scope} />
      <Deliverables block={blocks[SERVICE_SECTIONS.deliverables]} items={deliverables} />
      <Process block={blocks[SERVICE_SECTIONS.process]} steps={steps} />
    </>
  );
}
