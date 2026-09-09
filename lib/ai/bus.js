import { sectionApi, sectionNode } from './sections';
import { scrollToElement } from '@/lib/scroll/controller';
import { NAVIGATION_ACTIONS, PAGE_ACTIONS, PAGE_BUS } from '@/constants';

const waiting = new Set();

const isNavigation = (action) => NAVIGATION_ACTIONS.includes(action.type);

const goToSection = ({ sectionId }) => {
  const node = sectionNode(sectionId);
  if (!node) return false;
  scrollToElement(node, { duration: PAGE_BUS.scrollMs });
  return true;
};

const delegate = (action) => {
  const api = sectionApi(action.sectionId);
  const handler = api && api[action.type];
  return typeof handler === 'function' && handler(action) !== false;
};

const execute = (action) => (action.type === PAGE_ACTIONS.goTo ? goToSection(action) : delegate(action));

const oneNavigation = (actions) => {
  let navigated = false;
  return actions.filter((action) => {
    if (!isNavigation(action)) return true;
    if (navigated) return false;
    navigated = true;
    return true;
  });
};

const shaped = (action) => Boolean(action) && typeof action.type === 'string';

export function runPageActions(actions) {
  if (!Array.isArray(actions)) return [];
  const ran = oneNavigation(actions.filter(shaped)).filter(execute);
  if (ran.length) waiting.forEach((listener) => listener(ran));
  return ran;
}

export function watchPageAction(listener) {
  waiting.add(listener);
  return () => waiting.delete(listener);
}
