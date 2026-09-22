export const SERVICE_SECTIONS = Object.freeze({
  hero: 'hero-service',
  scope: 'scope',
  process: 'process',
  deliverables: 'deliverables',
  contact: 'contact',
});

export const SERVICE_CLIPS = Object.freeze(['development', 'games', 'marketing']);

export const SECTION_IDS = Object.freeze(Object.values(SERVICE_SECTIONS));
export const TARGET_IDS = Object.freeze(SECTION_IDS.filter((id) => id !== SERVICE_SECTIONS.hero));

export const PAGE_ACTIONS = Object.freeze({
  goTo: 'goToSection',
  open: 'openBlock',
  filter: 'filterCaseStudies',
  highlight: 'highlight',
});

export const NAVIGATION_ACTIONS = Object.freeze([PAGE_ACTIONS.goTo]);

export const PAGE_BUS = { scrollMs: 700, markMs: 2400 };

export const GUIDE = {
  model: 'gpt-5.4-nano',
  maxOutputTokens: 400,
  turns: 8,
  limits: { message: 500 },
  window: { ms: 86400000, max: 20 },
  cache: { ms: 86400000, max: 100 },
  greetingWordMs: 55,
  starterStepMs: 90,
  greetLatestMs: 4200,
  dockExitMs: 240,
  nudgeFirstMs: 9000,
  nudgeEveryMs: 38000,
  nudgeHoldMs: 6200,
};

export const GUIDE_EVENTS = {
  open: 'guide_open',
  close: 'guide_close',
  starterClick: 'guide_starter_click',
  ask: 'guide_ask',
  answered: 'guide_answered',
  action: 'guide_page_action',
  failure: 'guide_failure',
  capped: 'guide_capped',
};
