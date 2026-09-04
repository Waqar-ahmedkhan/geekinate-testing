let engine = null;

export const setScrollEngine = (instance) => {
  engine = instance;
};

export const scrollToTop = () => {
  if (engine) engine.scrollTo(0, { force: true });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};
