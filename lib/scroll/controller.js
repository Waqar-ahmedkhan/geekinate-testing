let engine = null;

export const setScrollEngine = (instance) => {
  engine = instance;
};

export const scrollToTop = () => {
  if (engine) engine.scrollTo(0, { force: true });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const syncScrollEngine = () => {
  if (!engine) return;
  engine.resize();
  engine.scrollTo(window.scrollY, { immediate: true, force: true });
};

const railOffset = () => {
  const declared = getComputedStyle(document.documentElement).getPropertyValue('--nav-rail');
  const rail = Number.parseFloat(declared);
  return Number.isFinite(rail) ? rail : 0;
};

const SETTLE_MS = 280;
const SETTLE_EPSILON = 2;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollToElement = (node, { immediate = false, duration } = {}) => {
  if (!node || typeof window === 'undefined') return;
  const jump = immediate || reducedMotion();
  const offset = railOffset();
  const target = Math.round(node.getBoundingClientRect().top + window.scrollY - offset);
  const native = () => window.scrollTo({ top: target, behavior: jump ? 'auto' : 'smooth' });
  if (!engine || jump) {
    native();
    return;
  }
  const from = window.scrollY;
  engine.scrollTo(node, duration ? { offset: -offset, duration: duration / 1000 } : { offset: -offset });
  window.setTimeout(() => {
    if (Math.abs(window.scrollY - from) < SETTLE_EPSILON) native();
  }, SETTLE_MS);
};
