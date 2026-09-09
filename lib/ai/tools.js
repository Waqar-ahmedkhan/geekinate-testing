import { jsonSchema, tool } from 'ai';
import { BLUEPRINT, PAGE_ACTIONS, SECTION_IDS } from '@/constants';

const ack = async () => ({ ok: true });

const shape = (properties) => jsonSchema({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });

export const guideTools = {
  [PAGE_ACTIONS.goTo]: tool({
    description:
      'Scroll the page to a named section and bring it into view. Use this at most once per reply, and only when the answer is about what that section contains.',
    inputSchema: shape({ sectionId: { type: 'string', enum: [...SECTION_IDS] } }),
    execute: ack,
  }),
  [PAGE_ACTIONS.highlight]: tool({
    description:
      'Briefly outline one section while the answer refers to it. Use sparingly, and never together with a scroll to the same section.',
    inputSchema: shape({ sectionId: { type: 'string', enum: [...SECTION_IDS] } }),
    execute: ack,
  }),
  [PAGE_ACTIONS.prefill]: tool({
    description:
      'Send the visitor to the blueprint tool with their business already typed in. Use this when they describe their own business or ask what could be automated for them.',
    inputSchema: shape({ businessDescription: { type: 'string', maxLength: BLUEPRINT.limits.brief } }),
    execute: ack,
  }),
};
