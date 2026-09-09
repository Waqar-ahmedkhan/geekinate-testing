import { SECTION_IDS } from '@/constants';

const handlers = new Map();

export const knownSection = (id) => SECTION_IDS.includes(id);

export function registerSection(id, api) {
  if (!knownSection(id)) return () => {};
  handlers.set(id, api);
  return () => {
    if (handlers.get(id) === api) handlers.delete(id);
  };
}

export const sectionApi = (id) => (knownSection(id) ? handlers.get(id) || null : null);

export const sectionNode = (id) => {
  if (typeof document === 'undefined' || !knownSection(id)) return null;
  return document.getElementById(id);
};
