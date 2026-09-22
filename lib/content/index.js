import { NAV_LINKS, PARTNER, SERVICE_SECTIONS } from '@/constants';

export * from './guide';
export * from './partner';
export * from './work';

export const heroContent = {
  pillars: ['AI', 'Games', 'Marketing', 'Web'],
  headline: { lead: 'We build AI, games,', trail: 'and the web around them.' },
  actions: [
    { label: 'Start a project', href: '#contact', accent: true },
    { label: 'See the work', href: '#work', accent: false },
  ],
};

export const clientsContent = {
  heading: 'Trusted by.',
};

export const clients = [
  { name: 'Space Manager', src: '/media/clients/space-manager.webp', width: 997, size: 28 },
  { name: 'LVL AZN', src: '/media/clients/lvl-azn.webp', width: 199, size: 52 },
  { name: 'TwinHub', src: '/media/clients/twinhub.webp', width: 694, size: 32 },
  { name: 'Elevé', src: '/media/clients/eleve-mark.webp', width: 119, size: 58 },
  { name: 'Central Pediatrics', src: '/media/clients/central-pediatrics.webp', width: 619, size: 34 },
  { name: 'Lilia', src: '/media/clients/lilia.webp', width: 449, size: 44 },
  { name: 'Aroma Farmacy', src: '/media/clients/aroma-farmacy.webp', width: 784, size: 30 },
  { name: 'LinkTax Accountants', src: '/media/clients/link-tax.webp', width: 355, size: 44 },
];

export const servicesContent = {
  eyebrow: 'Services',
  heading: 'Three disciplines, one build team.',
  body: 'Every engagement ships running code, not a deck.',
};

export const services = [
  {
    slug: 'development',
    title: 'Development & AI',
    summary: 'Web products, platforms, and the agents and pipelines that run inside them.',
    media: { sources: [{ src: '/media/services/ai.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'We build the product, then the', mark: 'intelligence', trail: 'inside it.' },
    lead: 'Web products and platforms built to be maintained, plus the agents, pipelines and automations that take the repetitive work off your team. One build team, from the first scope call to the handover.',
    scopeIntro: 'Thinking about adding AI to your product?',
    handoff: { lead: 'Got a vibe coded app?', trail: 'Let’s Geekinate it.' },
    facts: [
      { label: 'First release', value: '1 week' },
      { label: 'Shipped to', value: 'Your repo, your infra' },
      { label: 'Handover', value: 'Documented, no lock-in' },
    ],
    scope: [
      { title: 'Web products', detail: 'Marketing sites, portals and dashboards that hold up under real traffic.' },
      { title: 'Internal platforms', detail: 'The tool your team opens every morning, built around how they actually work.' },
      { title: 'AI agents', detail: 'Assistants scoped to your data, with every answer traceable back to it.' },
      { title: 'Automation pipelines', detail: 'The manual copying between two systems, taken off the team for good.' },
      { title: 'Integrations and APIs', detail: 'Two systems that were never meant to talk, talking reliably.' },
      { title: 'Rescue and rebuild', detail: 'An inherited codebase made shippable again, without starting over.' },
    ],
    steps: [
      { title: 'Scope', detail: 'We settle what the thing has to do before anyone argues about how it looks.' },
      { title: 'Build', detail: 'Weekly releases you can open. Reviews run against working software, never mockups.' },
      { title: 'Ship', detail: 'Deployed to your infrastructure with the monitoring and the runbook already in place.' },
      { title: 'Stay', detail: 'We stay on after launch, because the first month of real use writes the real list.' },
    ],
    deliverables: [
      { title: 'Running', detail: 'A working system deployed on your own infrastructure, not parked on ours.' },
      { title: 'Owned', detail: 'The repository, the pipeline and every access key, in your name from day one.' },
      { title: 'Documented', detail: 'Documentation a new engineer can start from without booking a call with us.' },
      { title: 'Supported', detail: 'A named person to call after launch, not a shared inbox and a ticket number.' },
    ],
  },
  {
    slug: 'games',
    title: 'Games & Interactive',
    summary: 'Browser-native game mechanics that people finish, not bounce off.',
    media: { sources: [{ src: '/media/services/game.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Games people', mark: 'finish,', trail: 'built for the browser.' },
    lead: 'Browser-native mechanics, playable prototypes and interactive campaigns — the kind of thing that gets shared before it gets explained. No install, no store review, just a link that works.',
    scopeIntro: 'Thinking about a game for your brand?',
    handoff: { lead: 'What do you want to build?', trail: 'We will tell you how.' },
    facts: [
      { label: 'Playable build', value: 'Week three' },
      { label: 'Runs on', value: 'Any modern browser' },
      { label: 'Built with', value: 'WebGL, Canvas, three.js' },
    ],
    scope: [
      { title: 'Browser games', detail: 'Full titles that load from a link and still run on a phone.' },
      { title: 'Playable campaigns', detail: 'Ad units and launch mechanics people replay instead of skipping.' },
      { title: 'WebGL and 3D', detail: 'Real-time scenes that hold sixty frames on hardware people already own.' },
      { title: 'Prototypes', detail: 'A playable answer to the only question that matters, inside a fortnight.' },
      { title: 'Progression systems', detail: 'Scores, streaks and leaderboards, with the backend standing behind them.' },
      { title: 'Porting and tuning', detail: 'An existing build made to run where your players actually are.' },
    ],
    steps: [
      { title: 'Scope', detail: 'We agree the core loop first. Everything else is decoration until that one is fun.' },
      { title: 'Build', detail: 'A playable build from week three, updated every week after it.' },
      { title: 'Ship', detail: 'Tuned on real devices, with the load time budgeted before the art goes in.' },
      { title: 'Stay', detail: 'We watch the first players and fix what the numbers say, not what we assumed.' },
    ],
    deliverables: [
      { title: 'Playable', detail: 'A build on a link from week three, updated every week after that one.' },
      { title: 'Owned', detail: 'Source, assets and the build pipeline, in your name from day one.' },
      { title: 'Fast', detail: 'Performance budgets met on mid-range phones, not only on the machine it was built on.' },
      { title: 'Measured', detail: 'Analytics wired to the moments that decide whether a player comes back.' },
    ],
  },
  {
    slug: 'marketing',
    title: 'Marketing Systems',
    summary: 'Sites and funnels measured on pipeline, not page views.',
    media: { sources: [{ src: '/media/services/marketing.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Marketing measured on', mark: 'pipeline,', trail: 'not page views.' },
    lead: 'Sites, funnels and the measurement underneath them, built so the monthly report tells you what to do next instead of only what already happened.',
    scopeIntro: 'Thinking about what your marketing actually returns?',
    handoff: { lead: 'Stuck doing it manually?', trail: 'Let’s automate it.' },
    facts: [
      { label: 'First site live', value: '4 to 6 weeks' },
      { label: 'Reported on', value: 'Pipeline, not sessions' },
      { label: 'Owned by', value: 'You, from day one' },
    ],
    scope: [
      { title: 'Conversion sites', detail: 'The site that has to earn its traffic, built to be edited without us.' },
      { title: 'Landing systems', detail: 'A page per campaign, assembled from one set of components.' },
      { title: 'Analytics and attribution', detail: 'Tracking that survives a cookie banner and still names the source.' },
      { title: 'Lifecycle automation', detail: 'The follow-up that happens whether or not anybody remembers.' },
      { title: 'SEO foundations', detail: 'Structure, speed and schema — the part of the work that compounds.' },
      { title: 'Experiments', detail: 'A standing test queue with a hypothesis attached to every entry.' },
    ],
    steps: [
      { title: 'Scope', detail: 'We start from the number that has to move, then work backwards to the pages.' },
      { title: 'Build', detail: 'Pages and tracking ship together, so nothing goes live unmeasured.' },
      { title: 'Ship', detail: 'Live on your stack, with the dashboards already reading real traffic.' },
      { title: 'Stay', detail: 'A running test queue, and a report that ends in a recommendation.' },
    ],
    deliverables: [
      { title: 'Editable', detail: 'A site your team can change without booking a developer for every line.' },
      { title: 'Attributed', detail: 'Tracking that ties a lead back to the source that actually made it.' },
      { title: 'Reported', detail: 'A dashboard reading pipeline and revenue, not sessions and page views.' },
      { title: 'Queued', detail: 'A test queue with the next three experiments already written down.' },
    ],
  },
];

const serviceActions = [
  { label: 'Start a project', href: '#contact', accent: true },
  { label: 'See the work', href: '/#work' },
];

export const servicePageContent = {
  actions: serviceActions,
  blocks: [
    { id: SERVICE_SECTIONS.scope, label: 'Scope', heading: 'What we build.' },
    { id: SERVICE_SECTIONS.process, label: 'Process', heading: 'How it runs.' },
    { id: SERVICE_SECTIONS.deliverables, label: 'Deliverables', heading: 'What you leave with.' },
  ],
};

export const testimonialsContent = {
  eyebrow: 'Testimonials',
  heading: 'Do not take our word for it',
  footnote: '*Take theirs',
};

export const testimonials = [
  {
    name: 'Jahangir Afzal',
    role: 'Cofounder · Twinhub',
    quote:
      'Geekinate delivered a custom, responsive, fast-loading website with a modern UI/UX. They managed the project excellently, responded positively to our concerns, and consistently came up with the best solutions.',
  },
  {
    name: 'Operations & IT Manager',
    role: 'Advertising & marketing company · Clutch',
    quote:
      'Geekinate delivered the project on time and stood out through clear communication, flexibility, and high-quality work. Their first version even arrived ahead of schedule.',
  },
  {
    name: 'Director of Development',
    role: 'Real-estate tokenization company · Clutch',
    quote:
      'Geekinate built a useful React front end that met our expectations. Their communication was excellent, and every part of the work was reviewed throughout the project.',
  },
  {
    name: 'Jahangeer Qureshi',
    role: 'CTO · Argent Tech',
    quote:
      'Geekinate played a pivotal role in developing our AI SaaS dashboard for an intelligent document processor. Their flexibility and dedication in handling new requirements were truly commendable.',
  },
  {
    name: 'Alessandro Riesenegger',
    role: 'Germany',
    quote:
      'Geekinate developed a high-quality web platform with precision and professionalism. They communicated quickly, delivered excellent results, and maintained continuous quality assurance throughout the project.',
  },
  {
    name: 'Aala Ghabris',
    role: 'UAE',
    quote:
      'From onboarding through delivery, Geekinate showed complete professionalism, genuine interest in making the product successful, and real dedication to the work. Their communication was top-notch.',
  },
  {
    name: 'Tuna Beklevic',
    role: 'USA',
    quote:
      'Geekinate exceeded our expectations with an independent research report for a new social media platform. The work was exactly what we needed, supported by excellent communication and professional service.',
  },
  {
    name: 'Faisal Iltaf',
    role: 'Pakistan',
    quote:
      'Geekinate is highly skilled, articulate, and knows its work. They go out of their way to recommend best practices, and I would definitely hire them again for future tasks.',
  },
];

export const ctaContent = {
  heading: 'Ready to Geekinate?',
};

export const contactContent = {
  eyebrow: 'Contact',
  headings: [
    'What are you trying to build?',
    'What do you want to automate?',
    'What’s eating up your team’s time?',
    'What’s slowing your team down?',
  ],
  intro:
    'Tell us the problem, not the specification. Half of what we do best starts as a sentence somebody was not sure counted as a brief.',
  availability: 'Taking on new projects',
  steps: [
    { title: 'A reply from a person', detail: 'Within two working days, from whoever would actually run the build.' },
    { title: 'A call, if it earns one', detail: 'Thirty minutes to work out whether we are the right team for this.' },
    { title: 'A scope with numbers in it', detail: 'What we would build, how long it takes, and what it costs.' },
  ],
  direct: { lead: 'Or contact us directly at' },
  topics: {
    label: 'Closest to',
    optional: 'optional',
    options: [...services.map(({ slug, title }) => ({ value: slug, label: title })), { value: 'other', label: 'Something else' }],
  },
  fields: {
    name: { label: 'Name', placeholder: 'Your name', autoComplete: 'name' },
    email: { label: 'Email', placeholder: 'you@company.com', autoComplete: 'email' },
    company: { label: 'Company', optional: 'optional', placeholder: 'Where you work', autoComplete: 'organization' },
    message: { label: 'What you need', placeholder: 'What you are building, and what is in the way of it.' },
  },
  errors: {
    name: 'Add your name so we know who is writing.',
    email: 'Add an email address so we can reply.',
    emailShape: 'That address is missing an @ or a domain.',
    message: 'Tell us what you need, even in one line.',
    messageShort: 'A little more detail, so the reply is worth reading.',
  },
  submit: { idle: 'Submit', pending: 'Submitting' },
  success: {
    title: 'Message sent',
    body: 'We read every one of these ourselves. Expect a reply within two working days.',
    again: 'Send another',
  },
  failure: { title: 'That did not send.', body: 'Try again, or write to us directly.' },
};

export const footerContent = {
  location: 'Remote — Worldwide',
  rights: 'All rights reserved.',
};

export const footerColumns = [
  {
    title: 'Quick links',
    links: [
      { label: 'Home', href: '/' },
      ...NAV_LINKS,
      { label: 'Partner', href: PARTNER.path },
      { label: 'Privacy Policy', href: '' },
      { label: 'Terms of Service', href: '' },
    ],
  },
  { title: 'Services', links: services.map(({ slug, title }) => ({ label: title, href: `/services/${slug}` })) },
];

export const footerMedia = {
  sources: [{ src: '/media/footer/stokt-golf-ball-render.webm', type: 'video/webm' }],
  poster: '',
};
