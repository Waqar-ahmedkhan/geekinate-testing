import { NAV_LINKS } from '@/constants';

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
  },
  {
    slug: 'games',
    title: 'Games & Interactive',
    summary: 'Browser-native game mechanics that people finish, not bounce off.',
    media: { sources: [{ src: '/media/services/game.mp4', type: 'video/mp4' }], poster: '', loop: false },
  },
  {
    slug: 'marketing',
    title: 'Marketing Systems',
    summary: 'Sites and funnels measured on pipeline, not page views.',
  },
];

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
    links: [{ label: 'Home', href: '/' }, ...NAV_LINKS, { label: 'Privacy Policy', href: '' }, { label: 'Terms of Service', href: '' }],
  },
  { title: 'Services', links: services.map(({ title }) => ({ label: title, href: '#services' })) },
];

export const footerMedia = {
  sources: [{ src: '/media/footer/stokt-golf-ball-render.webm', type: 'video/webm' }],
  poster: '',
};
