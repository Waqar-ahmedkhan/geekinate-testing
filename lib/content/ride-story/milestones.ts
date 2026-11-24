import type { Milestone, Metric } from './CONTENT_SCHEMA';

function entry(
  id: string,
  month: string,
  year: number | null,
  title: string,
  action: string,
  context: string,
  evidence: string,
  consequence: string,
  people: string[],
  art: string,
  metrics: Metric[] = [],
  trigger: string | null = null
): Milestone {
  return { id, month, year, title, action, context, evidence, consequence, people, metrics, trigger, assetIds: [art] };
}

export const milestones = [
  entry(
    'origin',
    'September',
    2019,
    'The first studio notebook',
    'Hamza starts sketching brand identities, interfaces, and design systems from a single fieldbook.',
    'Early digital products needed cohesive visual identity.',
    'First brand & UI field notes.',
    'Established the design-first craft that anchors Geekinate.',
    ['usama'],
    'ledger'
  ),
  entry(
    'first-systems',
    'May',
    2020,
    'From sketches to shipped systems',
    'Early design explorations turn into repeatable web architectures built for speed and clarity.',
    'Clients needed production-ready web systems.',
    'Reusable UI architecture.',
    'Set the foundation for full-cycle delivery.',
    ['usama'],
    'ledger'
  ),
  entry(
    'adil-joins',
    'October',
    2021,
    'Bilal meets Hamza',
    'Together they unite product design with full-stack software engineering and AI workflows.',
    'Ambitious products required custom engineering.',
    'Development & AI capability formed.',
    'United product design and software engineering.',
    ['usama', 'adil'],
    'mobile',
    [],
    'Bilal joins Hamza.'
  ),
  entry(
    'twinhub-launch',
    'March',
    2022,
    'Twinhub platform goes live',
    'The crew ships high-performance web platforms engineered to scale.',
    'Modern teams needed fast digital platforms.',
    'Twinhub web build.',
    'Proved the end-to-end design-to-code loop.',
    ['usama', 'adil'],
    'mobile'
  ),
  entry(
    'nouman-joins',
    'August',
    2022,
    'Meeting Zain',
    'The team meets Zain, bringing marketing strategy, growth campaigns, and client delivery.',
    'Great products needed to reach real audiences.',
    'Marketing & strategy pillar.',
    'Connected product builds directly to growth.',
    ['nouman'],
    'merge',
    [],
    'Zain joins the crew.'
  ),
  entry(
    'shifa-growth',
    'July',
    2023,
    'Shifa Foundation USA · 5× growth',
    'Focused digital campaigns and clear donor journeys help monthly online giving reach 5× starting volume.',
    'Nonprofit fundraising needed frictionless conversion.',
    'Shifa Foundation USA case study.',
    'Demonstrated measurable campaign impact.',
    ['nouman'],
    'merge'
  ),
  entry(
    'waqar-joins',
    'April',
    2024,
    'Meeting Rayan',
    'Rayan joins the crew to lead interactive web experiences, 3D motion, and AR/VR game development.',
    'Brands wanted playable, memorable worlds.',
    'Games & Interactive pillar.',
    'Completed Geekinate’s three core disciplines.',
    ['waqar'],
    'phone',
    [],
    'Rayan joins the crew.'
  ),
  entry(
    'geekinate-v2',
    'July',
    2026,
    'A brand-new geekinate.com',
    'The site is rebuilt from scratch: one particle system, three core services, and all four makers shipping at a whole new pace.',
    'The studio needed a home matching its real craft.',
    'geekinate.com & Elevé showcase.',
    'Ready for the next chapter.',
    ['usama', 'adil', 'nouman', 'waqar'],
    'world'
  ),
];
