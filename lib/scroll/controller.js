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

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollToElement = (node, { immediate = false, duration } = {}) => {
  if (!node || typeof window === 'undefined') return;
  const jump = immediate || reducedMotion();
  const offset = railOffset();
  if (engine && !jump) {
    engine.scrollTo(node, duration ? { offset: -offset, duration: duration / 1000 } : { offset: -offset });
    return;
  }
  const top = node.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: jump ? 'auto' : 'smooth' });
};
