export const stage = { heroOut: 0, footerIn: 0, form: 0, globe: 1, light: 0 };

const HERO_SPAN = 1.4;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

let heroEl = null,
  footerEl = null;

const find = (current, selector) => (current && current.isConnected ? current : document.querySelector(selector));

export const measureStage = () => {
  if (typeof document === 'undefined') return;
  heroEl = find(heroEl, '#hero');
  footerEl = find(footerEl, 'footer');
  const view = window.innerHeight || 1;
  if (heroEl) stage.heroOut = clamp01(-heroEl.getBoundingClientRect().top / (view * HERO_SPAN));
  if (footerEl) stage.footerIn = clamp01((view - footerEl.getBoundingClientRect().top) / view);
};
