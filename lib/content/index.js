import { NAV_LINKS, PARTNER } from '@/constants';

export * from './partner';

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

export const workContent = {
  eyebrow: 'Work',
  heading: 'Featured work.',
  allWork: { label: 'All work', href: '' },
};

export const work = [
  {
    slug: 'project-one',
    title: 'Project one',
    disciplines: ['Web Products'],
    span: 2,
    href: '',
    media: { sources: [{ src: '/media/work/stokt-fish-eye-laptop.mp4', type: 'video/mp4' }], poster: '' },
  },
  {
    slug: 'project-two',
    title: 'Project two',
    disciplines: ['AI & Automation'],
    span: 1,
    href: '',
    media: { sources: [{ src: '/media/work/stokt-wsi-trim-sr.webm', type: 'video/webm' }], poster: '' },
  },
  {
    slug: 'project-three',
    title: 'Project three',
    disciplines: ['Marketing Systems', 'Web Products'],
    span: 3,
    href: '',
    media: { sources: [{ src: '/media/work/pexels-5562045-analytics.mp4', type: 'video/mp4' }], poster: '' },
  },
  {
    slug: 'project-four',
    title: 'Project four',
    disciplines: ['Games & Interactive'],
    span: 1,
    href: '',
    media: { sources: [{ src: '/media/work/pexels-12669619-gaming.mp4', type: 'video/mp4' }], poster: '' },
  },
  {
    slug: 'project-five',
    title: 'Project five',
    disciplines: ['AI & Automation'],
    span: 1,
    href: '',
    media: { sources: [{ src: '/media/work/pexels-3141210-ai.mp4', type: 'video/mp4' }], poster: '' },
  },
  {
    slug: 'project-six',
    title: 'Project six',
    disciplines: ['Web Products'],
    span: 1,
    href: '',
    media: { sources: [{ src: '/media/work/pexels-11274330-web.mp4', type: 'video/mp4' }], poster: '' },
  },
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
      'A running system on your own infrastructure',
      'The repository, the pipeline and the access, in your name',
      'Documentation a new engineer can start from',
      'A named person to call after launch',
    ],
  },
  {
    slug: 'games',
    title: 'Games & Interactive',
    summary: 'Browser-native game mechanics that people finish, not bounce off.',
    media: { sources: [{ src: '/media/services/game.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Games people', mark: 'finish,', trail: 'built for the browser.' },
    lead: 'Browser-native mechanics, playable prototypes and interactive campaigns — the kind of thing that gets shared before it gets explained. No install, no store review, just a link that works.',
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
      'A playable build on a link, from week three',
      'Source, assets and the build pipeline, in your name',
      'Performance budgets met on mid-range phones',
      'Analytics wired to the moments that decide retention',
    ],
  },
  {
    slug: 'marketing',
    title: 'Marketing Systems',
    summary: 'Sites and funnels measured on pipeline, not page views.',
    media: { sources: [{ src: '/media/services/marketing.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Marketing measured on', mark: 'pipeline,', trail: 'not page views.' },
    lead: 'Sites, funnels and the measurement underneath them, built so the monthly report tells you what to do next instead of only what already happened.',
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
      'A site your team can edit without a developer',
      'Tracking that ties a lead back to the source that made it',
      'A dashboard reporting pipeline, not sessions',
      'A test queue with the next three experiments already in it',
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
    { id: 'scope', label: 'Scope', heading: 'What we build.' },
    { id: 'process', label: 'Process', heading: 'How it runs.' },
    { id: 'deliverables', label: 'Deliverables', heading: 'What you leave with.' },
  ],
  handoff: {
    headline: { lead: 'Tell us what you are building.', trail: 'We will tell you how.' },
    actions: serviceActions,
  },
};

export const testimonialsContent = {
  eyebrow: 'Testimonials',
  heading: 'Do not take our word for it',
  footnote: '*Take theirs',
};

export const testimonials = [
  {
    name: 'Placeholder One',
    role: 'Founder · Company A',
    quote:
      'They understood the goal before writing a line of code, and the thing they shipped is still the thing we use every day. Two years on, nobody has asked for a rebuild, which is not something I can say about anything else we have commissioned.',
  },
  {
    name: 'Placeholder Two',
    role: 'Head of Operations · Company B',
    quote:
      'Two weeks in we had a working system, not a deck about a working system. That set the tone for everything after it — every review had something running behind it, so we were arguing about real behaviour instead of mockups.',
  },
  {
    name: 'Placeholder Three',
    role: 'CTO · Company C',
    quote:
      'We had been quoted six months by two other studios. Geekinate scoped it honestly, cut the parts that did not matter, and had the first release in front of customers inside eight weeks. The follow-through after launch is what actually sold us on working with them again.',
  },
  {
    name: 'Placeholder Four',
    role: 'Marketing Director · Company D',
    quote:
      'Our funnel finally reports on pipeline instead of page views, and that change alone paid for the engagement twice over. It also settled an argument we had been having internally for about a year about what we should actually be measuring.',
  },
  {
    name: 'Placeholder Five',
    role: 'Product Lead · Company E',
    quote:
      'The automation work removed about fifteen hours of manual copying every week. Nobody on the team has asked to go back to the old process.',
  },
  {
    name: 'Placeholder Six',
    role: 'Creative Director · Company F',
    quote:
      'Fast, precise, and genuinely opinionated in the way you want a build partner to be. They pushed back on two of our early decisions, were right about both, and did it early enough that changing course cost us nothing.',
  },
  {
    name: 'Placeholder Seven',
    role: 'Co-founder · Company G',
    quote:
      'They treated a small first project like it mattered. Every detail we asked for landed, and a few we had not thought to ask for landed too. We came in as a trial engagement and left with a roadmap for the next three.',
  },
  {
    name: 'Placeholder Eight',
    role: 'Engineering Manager · Company H',
    quote:
      'The handover documentation was better than what we write for ourselves. A new engineer joined three months after the project closed and had the whole thing running locally before lunch on their first day.',
  },
  {
    name: 'Placeholder Nine',
    role: 'Founder · Company I',
    quote:
      'What I did not expect was how much of the value came from the questions. Half the features on our original list never got built because they talked us out of them, and the product is better for it.',
  },
  {
    name: 'Placeholder Ten',
    role: 'Growth Lead · Company J',
    quote:
      'Clear communication the whole way. We always knew what was happening, what was next, and what was at risk — which meant I never had to chase anyone for a status update.',
  },
  {
    name: 'Placeholder Eleven',
    role: 'Operations Director · Company K',
    quote:
      'The internal tool they built replaced three spreadsheets and a weekly meeting. The team adopted it without being asked to, which is the only adoption metric I have ever trusted.',
  },
  {
    name: 'Placeholder Twelve',
    role: 'Managing Partner · Company L',
    quote:
      'A real build team. They stayed involved after launch, which is the part most agencies quietly skip, and it is the part that made the difference for us.',
  },
];

export const ctaContent = {
  heading: 'Ready to Geekinate?',
};

export const contactContent = {
  eyebrow: 'Contact',
  heading: 'What are you trying to build?',
  intro:
    'Tell us the problem, not the specification. Half of what we do best starts as a sentence somebody was not sure counted as a brief.',
  availability: 'Taking on new projects',
  steps: [
    { title: 'A reply from a person', detail: 'Within two working days, from whoever would actually run the build.' },
    { title: 'A call, if it earns one', detail: 'Thirty minutes to work out whether we are the right team for this.' },
    { title: 'A scope with numbers in it', detail: 'What we would build, how long it takes, and what it costs.' },
  ],
  direct: { label: 'Or write to us directly' },
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
  submit: { idle: 'Send it', pending: 'Sending' },
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
