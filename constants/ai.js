export const SERVICE_SECTIONS = Object.freeze({
  hero: 'hero-service',
  scope: 'scope',
  process: 'process',
  deliverables: 'deliverables',
  blueprint: 'blueprint',
  contact: 'contact',
});

export const SECTION_IDS = Object.freeze(Object.values(SERVICE_SECTIONS));

export const PAGE_ACTIONS = Object.freeze({
  goTo: 'goToSection',
  open: 'openBlock',
  filter: 'filterCaseStudies',
  highlight: 'highlight',
  prefill: 'prefillBlueprint',
});

export const NAVIGATION_ACTIONS = Object.freeze([PAGE_ACTIONS.goTo]);

export const PAGE_BUS = { scrollMs: 700 };

export const BLUEPRINT = {
  efforts: Object.freeze(['weeks', 'a month', 'a quarter']),
  steps: { min: 3, max: 5 },
  opportunities: 3,
  minBrief: 12,
  limits: { brief: 500, line: 200, email: 200 },
  window: { ms: 3600000, max: 3 },
  emailWindow: { ms: 3600000, max: 5 },
  cache: { ms: 86400000, max: 200 },
  model: 'gpt-5.4-mini',
  maxOutputTokens: 1200,
};

export const BLUEPRINT_TRANSFORM = { stepMs: 620 };

export const BLUEPRINT_REVEAL = {
  rise: 12,
  ease: 'power2.out',
  head: 0.3,
  columns: 0.4,
  columnsAt: 0.1,
  builds: 0.3,
  buildsAt: 0.3,
  stagger: 0.06,
  capture: 0.3,
  captureAt: 0.46,
};

export const BLUEPRINT_EVENTS = {
  sectionView: 'blueprint_section_view',
  exampleClick: 'blueprint_example_click',
  formStart: 'blueprint_form_start',
  formSubmit: 'blueprint_form_submit',
  formSuccess: 'blueprint_form_success',
  formFailure: 'blueprint_form_failure',
  rateLimited: 'blueprint_rate_limited',
  captureSubmit: 'blueprint_capture_submit',
  captureSuccess: 'blueprint_capture_success',
  captureFailure: 'blueprint_capture_failure',
};
