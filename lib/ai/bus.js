import { sectionNode } from './sections';
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

const marks = new Map();

const highlight = ({ sectionId }) => {
  const node = sectionNode(sectionId);
  if (!node) return false;
  window.clearTimeout(marks.get(node));
  node.setAttribute('data-marked', '');
  marks.set(
    node,
    window.setTimeout(() => {
      node.removeAttribute('data-marked');
      marks.delete(node);
    }, PAGE_BUS.markMs)
  );
  return true;
};

const handled = { [PAGE_ACTIONS.goTo]: goToSection, [PAGE_ACTIONS.highlight]: highlight };

const execute = (action) => Boolean(handled[action.type]?.(action));

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
