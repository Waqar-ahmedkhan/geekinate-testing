import { SECTION_IDS } from '@/constants';

export const knownSection = (id) => SECTION_IDS.includes(id);

export const sectionNode = (id) => {
  if (typeof document === 'undefined' || !knownSection(id)) return null;
  return document.getElementById(id);
};
