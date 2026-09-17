import { syncScrollEngine } from './controller';
import { pageOffset, scrollProgress } from './progress';
import { COSMOS } from '@/constants';

export const stage = { hero: true, heroOut: 0, footerIn: 0, form: 0, globe: 1, light: 0, shape: '', shapeIn: 0, shapeGlow: 0, shapeMix: 0 };

export const shapeAnchor = { x: 0, y: 0, size: 0 };

const HERO_SPAN = 1.4;
const SHAPE_SELECTOR = '[data-cosmos-shape]';

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const offsetWithin = (node, ancestor) => {
  let top = 0,
    left = 0;
  for (let element = node; element && element !== ancestor; element = element.offsetParent) {
    top += element.offsetTop;
    left += element.offsetLeft;
  }
  return { top, left };
};
const documentTop = (node) => offsetWithin(node, null).top;

const layout = { view: 1, page: 0, heroTop: 0, footerTop: 0, hasFooter: false, ready: false };
const anchor = { sticky: false, left: 0, top: 0, width: 0, height: 0, holdFrom: 0, holdTo: 0, stickAt: 0 };

let heroEl = null,
  footerEl = null,
  shapeEl = null;

const find = (current, selector) => (current && current.isConnected ? current : document.querySelector(selector));

const stickyHolder = (node) => {
  for (let element = node.parentElement; element; element = element.parentElement) {
    if (getComputedStyle(element).position === 'sticky') return element;
  }
  return null;
};

const measureAnchor = (node) => {
  const holder = stickyHolder(node);
  const inner = offsetWithin(node, holder);
  anchor.sticky = Boolean(holder);
  anchor.width = node.offsetWidth;
  anchor.height = node.offsetHeight;
  anchor.top = inner.top;
  anchor.left = inner.left + (holder ? offsetWithin(holder, null).left : 0);
  if (!holder) return;
  anchor.holdFrom = documentTop(holder.parentElement);
  anchor.holdTo = anchor.holdFrom + holder.parentElement.offsetHeight - holder.offsetHeight;
  anchor.stickAt = parseFloat(getComputedStyle(holder).top) || 0;
};

const measureShape = (scroll) => {
  if (!stage.shape) {
    stage.shapeIn = 0;
    stage.shapeGlow = 0;
    return;
  }
  const holderTop = anchor.sticky ? Math.min(Math.max(anchor.stickAt, anchor.holdFrom - scroll), anchor.holdTo - scroll) : -scroll;
  const flowCentre = (anchor.sticky ? anchor.holdFrom : 0) + anchor.top + anchor.height / 2;
  const rest = Math.max(0, flowCentre - layout.view / 2);
  shapeAnchor.x = anchor.left + anchor.width / 2;
  shapeAnchor.y = holderTop + anchor.top + anchor.height / 2;
  shapeAnchor.size = Math.min(anchor.width, anchor.height);
  const leaving = (scroll - rest) / layout.view;
  stage.shapeGlow = 1 - clamp01(leaving / COSMOS.shapeSpan);
  stage.shapeIn = 1 - clamp01(leaving - COSMOS.shapeHold);
};

export const measureLayout = () => {
  if (typeof document === 'undefined') return;
  heroEl = find(heroEl, '#hero');
  footerEl = find(footerEl, 'footer');
  shapeEl = find(shapeEl, SHAPE_SELECTOR);
  stage.hero = Boolean(heroEl);
  stage.shape = shapeEl ? shapeEl.dataset.cosmosShape : '';
  layout.view = window.innerHeight || 1;
  layout.page = document.documentElement.scrollHeight;
  layout.heroTop = heroEl ? documentTop(heroEl) : 0;
  layout.footerTop = footerEl ? documentTop(footerEl) : 0;
  layout.hasFooter = Boolean(footerEl);
  if (shapeEl) measureAnchor(shapeEl);
  layout.ready = true;
};

export const measureStage = () => {
  if (typeof document === 'undefined') return;
  if (!layout.ready) measureLayout();
  const scroll = pageOffset();
  stage.heroOut = stage.hero ? clamp01((scroll - layout.heroTop) / (layout.view * HERO_SPAN)) : 1;
  measureShape(scroll);
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
