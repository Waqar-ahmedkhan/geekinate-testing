import { jsonSchema, tool } from 'ai';
import { PAGE_ACTIONS, TARGET_IDS } from '@/constants';

const ack = async () => ({ ok: true });
const shape = (properties) => jsonSchema({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const target = () => shape({ sectionId: { type: 'string', enum: [...TARGET_IDS] } });

export const guideTools = {
  [PAGE_ACTIONS.goTo]: tool({
    description: 'Offer a button under the reply that takes the visitor to one section when they press it. At most once per reply.',
    inputSchema: target(),
    execute: ack,
  }),
  [PAGE_ACTIONS.highlight]: tool({
    description: 'Briefly outline one section while the answer refers to it. Never together with a button to the same section.',
    inputSchema: target(),
    execute: ack,
  }),
};
