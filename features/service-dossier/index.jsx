import Deliverables from './Deliverables';
import Process from './Process';
import Scope from './Scope';
import { servicePageContent } from '@/lib/content';
import { DICE_SCOPES, SERVICE_SECTIONS } from '@/constants';

const blocks = Object.fromEntries(servicePageContent.blocks.map((block) => [block.id, block]));
const blockFor = (id, sections = {}) => ({ ...blocks[id], ...sections[id] });

export default function ServiceDossier({ service }) {
  const { slug, scope, scopeIntro, steps, deliverables, sections } = service;
  const dice = DICE_SCOPES.includes(slug);
  return (
    <>
      <Scope block={blockFor(SERVICE_SECTIONS.scope, sections)} intro={scopeIntro} items={scope} dice={dice} />
      <Deliverables block={blockFor(SERVICE_SECTIONS.deliverables, sections)} items={deliverables} />
      <Process block={blockFor(SERVICE_SECTIONS.process, sections)} steps={steps} />
    </>
  );
}
