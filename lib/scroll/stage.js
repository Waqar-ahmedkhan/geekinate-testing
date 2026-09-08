import { syncScrollEngine } from './controller';
import { pageOffset, scrollProgress } from './progress';

export const stage = { hero: true, heroOut: 0, footerIn: 0, form: 0, globe: 1, light: 0 };

const HERO_SPAN = 1.4;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const documentTop = (node) => {
  let top = 0;
  for (let element = node; element; element = element.offsetParent) top += element.offsetTop;
  return top;
};

const layout = { view: 1, page: 0, heroTop: 0, footerTop: 0, hasFooter: false, ready: false };

let heroEl = null,
  footerEl = null;

const find = (current, selector) => (current && current.isConnected ? current : document.querySelector(selector));

export const measureLayout = () => {
  if (typeof document === 'undefined') return;
  heroEl = find(heroEl, '#hero');
  footerEl = find(footerEl, 'footer');
  stage.hero = Boolean(heroEl);
  layout.view = window.innerHeight || 1;
  layout.page = document.documentElement.scrollHeight;
  layout.heroTop = heroEl ? documentTop(heroEl) : 0;
  layout.footerTop = footerEl ? documentTop(footerEl) : 0;
  layout.hasFooter = Boolean(footerEl);
  layout.ready = true;
};

export const measureStage = () => {
  if (typeof document === 'undefined') return;
  if (!layout.ready) measureLayout();
  const scroll = pageOffset();
  stage.heroOut = stage.hero ? clamp01((scroll - layout.heroTop) / (layout.view * HERO_SPAN)) : 1;
  if (!layout.hasFooter) return;
  const entered = layout.view - (layout.footerTop - scroll);
  const remaining = layout.page - layout.view - scroll;
  const span = entered + remaining;
  stage.footerIn = span > 0 ? clamp01(entered / span) : 1;
};

export const resetStage = () => {
  if (typeof document === 'undefined') return;
  syncScrollEngine();
  scrollProgress.offset = window.scrollY;
  layout.ready = false;
  measureLayout();
  measureStage();
};

export const watchStage = () => {
  if (typeof document === 'undefined') return () => {};
  measureLayout();
  const watcher = new ResizeObserver(measureLayout);
  watcher.observe(document.body);
  window.addEventListener('resize', measureLayout);
  return () => {
    watcher.disconnect();
    window.removeEventListener('resize', measureLayout);
  };
};
