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
