import Deliverables from './Deliverables';
import Process from './Process';
import Scope from './Scope';
import { servicePageContent } from '@/lib/content';

export default function ServiceDossier({ service }) {
  const { scope, steps, deliverables } = service;
  const [scopeBlock, processBlock, deliverablesBlock] = servicePageContent.blocks;
  return (
    <>
      <Scope block={scopeBlock} items={scope} />
      <Process block={processBlock} steps={steps} />
      <Deliverables block={deliverablesBlock} items={deliverables} />
    </>
  );
}
