import { parseJsonEventStream, readUIMessageStream, uiMessageChunkSchema } from 'ai';
import { NAVIGATION_ACTIONS } from '@/constants';

const unwrapped = () =>
  new TransformStream({
    transform(part, controller) {
      if (part?.success) controller.enqueue(part.value);
    },
  });

export const textOf = (message) =>
  (message?.parts || [])
    .filter((part) => part?.type === 'text')
    .map((part) => part.text)
    .join('');

const SETTLED = ['input-available', 'output-available'];

export const isNavigation = (action) => NAVIGATION_ACTIONS.includes(action.type);

export const actionsOf = (message) =>
  (message?.parts || [])
    .filter((part) => typeof part?.type === 'string' && part.type.startsWith('tool-') && SETTLED.includes(part.state) && part.input)
    .map((part) => ({ id: part.toolCallId, action: { type: part.type.slice(5), ...part.input } }));

export const jumpOf = (message) => actionsOf(message).find(({ action }) => isNavigation(action))?.action.sectionId || '';

export const readGuide = (body) =>
  readUIMessageStream({ stream: parseJsonEventStream({ stream: body, schema: uiMessageChunkSchema }).pipeThrough(unwrapped()) });
