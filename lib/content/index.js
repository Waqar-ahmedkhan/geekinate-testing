import { NAV_LINKS, PARTNER, SERVICE_SECTIONS } from '@/constants';

export * from './guide';
export * from './partner';
export * from './work';

export const heroContent = {
  pillars: ['AI', 'Games', 'Marketing', 'Web'],
  headline: { lead: 'We build what other agencies', trail: 'only pitch.' },
  actions: [
    { label: 'Start your project', href: '#contact', accent: true },
    { label: 'See what we’ve shipped', href: '#work', accent: false },
  ],
};

export const clientsContent = {
  heading: 'Already building with us.',
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
  heading: 'One team to build it, launch it and grow it.',
  body: 'No juggling three agencies. The people who build your product are the people who grow it, so nothing gets lost in a hand-off.',
};

export const services = [
  {
    slug: 'development',
    title: 'Development & AI',
    summary: 'Web apps, platforms and AI agents that take the busywork off your team for good.',
    media: { sources: [{ src: '/media/services/ai.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Launch faster.', mark: 'Automate', trail: 'the rest.' },
    lead: 'From a first MVP to an AI agent that answers your customers at 3am, we design, build and ship software that gives your team hours back every week and gives your customers a reason to stay.',
    scopeIntro: 'Pick a starting point, or bring us the problem nobody else wanted to touch.',
    handoff: { lead: 'Got a vibe coded app?', trail: 'Let’s Geekinate it.' },
    facts: [
      { label: 'First release', value: 'Week one' },
      { label: 'Your code', value: '100% yours' },
      { label: 'Lock-in', value: 'Zero' },
    ],
    scope: [
      {
        title: 'Web apps and SaaS',
        detail: 'Customer-facing products that load fast, scale with you and look like you just raised a round.',
      },
      { title: 'Internal tools', detail: 'Swap the spreadsheet everyone is scared to touch for a tool your team actually likes opening.' },
      { title: 'AI agents', detail: 'Assistants that answer customers, qualify leads and draft the busywork, trained on your data.' },
      { title: 'Automations', detail: 'Copy-paste between systems, gone. The work moves on its own while your team does the human part.' },
      {
        title: 'Integrations and APIs',
        detail: 'Your CRM, payments and ops tools finally talking to each other, and never dropping a message.',
      },
      {
        title: 'Rescue and rebuild',
        detail: 'A half-built or vibe coded app made stable, fast and shippable, without starting from zero.',
      },
    ],
    steps: [
      { title: 'Scope', detail: 'One call to pin down what winning looks like. You leave with a plan, a timeline and a price.' },
      { title: 'Build', detail: 'Working software every week. Click it, break it, steer it. No surprises at the finish line.' },
      { title: 'Ship', detail: 'Live on your own infrastructure, monitored from minute one, with a runbook your team can follow.' },
      { title: 'Stay', detail: 'We stick around after launch to fix, tune and grow it as real users show us what matters.' },
    ],
    deliverables: [
      { title: 'Live', detail: 'A working product in your customers’ hands. Not a prototype, not a slide deck.' },
      { title: 'Yours', detail: 'Every line of code, every account and every key, in your name from day one.' },
      { title: 'Documented', detail: 'Docs clear enough that a new developer can pick it up without calling us.' },
      { title: 'Backed', detail: 'A real person who knows your build, on call after launch. Not a ticket queue.' },
    ],
  },
  {
    slug: 'games',
    title: 'Games & Interactive',
    summary: 'Games and interactive campaigns people play, replay and send to their friends.',
    media: { sources: [{ src: '/media/services/game.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Games people', mark: 'can’t put down,', trail: 'and can’t stop sharing.' },
    lead: 'Branded browser games, mobile AR and full VR worlds. We build playable experiences that grab attention in seconds, keep players coming back, and put your brand in their group chat.',
    scopeIntro: 'Got a game in your head? Here is how it gets out.',
    handoff: { lead: 'Got a game idea?', trail: 'Let’s make it playable.' },
    facts: [],
    scope: [
      {
        title: 'Branded games',
        detail: 'Interactive games built around your brand, product or campaign, designed to create engagement people remember.',
      },
      {
        title: 'Playable campaigns',
        detail: 'Playable ads, interactive launches and digital activations that turn audiences from viewers into participants.',
      },
      {
        title: 'Mobile & AR',
        detail: 'Mobile and augmented-reality experiences for products, events, physical spaces and location-based interaction.',
      },
      {
        title: 'VR experiences',
        detail: 'Immersive VR games and experiences for standalone headsets, events, entertainment and interactive storytelling.',
      },
      {
        title: 'Industrial XR & simulation',
        detail:
          'Real-time simulations for healthcare, training, robotics and industry — from medical scenarios to equipment and process simulation.',
      },
      {
        title: 'Prototypes & MVPs',
        detail: 'Playable prototypes and functional MVPs that validate an idea, interaction or technical concept before larger investment.',
      },
    ],
    steps: [
      { title: 'Scope', detail: 'We define the core experience, platform and success criteria before production starts.' },
      { title: 'Build', detail: 'We get a working build in your hands early, then improve it through short, focused iterations.' },
      { title: 'Ship', detail: 'Built and tested on real target hardware, not just the machines we develop it on.' },
      { title: 'Evolve', detail: 'We use real feedback and data to improve what matters after launch.' },
    ],
    deliverables: [
      {
        title: 'Playable',
        detail: 'A working build early, so you can test the idea, interaction and direction before the project gets expensive.',
      },
      { title: 'Yours', detail: 'Source code, project files and build pipeline structured for your team to own from day one.' },
      { title: 'Smooth', detail: 'Optimized for real hardware, not just the machines we build it on.' },
      { title: 'Measured', detail: 'Track the outcomes that matter, from retention to training performance.' },
    ],
  },
  {
    slug: 'marketing',
    title: 'Marketing Systems',
    summary: 'Websites, funnels and campaigns that turn visitors into paying customers.',
    media: { sources: [{ src: '/media/services/marketing.mp4', type: 'video/mp4' }], poster: '', loop: false },
    headline: { lead: 'Turn visitors into', mark: 'paying customers,', trail: 'and prove it in revenue.' },
    lead: 'Websites, funnels, campaigns and content built for one job: bringing in customers. Every lead is traced back to where it came from, so you know exactly where to spend more and what to switch off.',
    scopeIntro: 'Where is your marketing leaking money?',
    handoff: { lead: 'Traffic but no sales?', trail: 'Let’s fix your funnel.' },
    facts: [
      { label: 'First launch', value: '4 to 6 weeks' },
      { label: 'We report on', value: 'Leads and revenue' },
      { label: 'Your data', value: 'Always yours' },
    ],
    scope: [
      { title: 'Websites that sell', detail: 'A site that sells while you sleep. Fast, clear, and easy for your team to update.' },
      { title: 'Landing pages and funnels', detail: 'A page for every campaign, built to turn clicks into sign-ups, calls and sales.' },
      {
        title: 'Tracking and attribution',
        detail: 'See which channel, ad and post brought in each customer. No more guessing with the budget.',
      },
      { title: 'Email and follow-up', detail: 'Sequences that keep warm leads warm until they are ready to buy.' },
      { title: 'SEO that compounds', detail: 'Speed, structure and content that climb the rankings and keep sending you free traffic.' },
      { title: 'Growth experiments', detail: 'A steady run of tests, each with a clear bet behind it, so results get better every month.' },
    ],
    steps: [
      { title: 'Scope', detail: 'We start from the number you need to hit, leads or sales or sign-ups, and work backwards.' },
      { title: 'Build', detail: 'Pages, campaigns and tracking launch together, so every click counts from day one.' },
      { title: 'Ship', detail: 'Live on your stack, with a dashboard showing real leads instead of vanity numbers.' },
      { title: 'Stay', detail: 'We keep testing and tuning, and every report ends with what to do next.' },
    ],
    deliverables: [
      { title: 'Editable', detail: 'A site your team can update in minutes, without waiting on a developer.' },
      { title: 'Tracked', detail: 'Every lead traced back to the channel that brought it in.' },
      { title: 'Reported', detail: 'A dashboard of leads and revenue, the numbers your boss actually asks about.' },
      { title: 'Growing', detail: 'The next three experiments already lined up, so growth never stalls.' },
    ],
  },
];

const serviceActions = [
  { label: 'Start your project', href: '#contact', accent: true },
  { label: 'See what we’ve shipped', href: '/#work' },
];

export const servicePageContent = {
  actions: serviceActions,
  blocks: [
    { id: SERVICE_SECTIONS.scope, label: 'Scope', heading: 'What we can build for you.' },
    { id: SERVICE_SECTIONS.process, label: 'Process', heading: 'How we get you live.' },
    { id: SERVICE_SECTIONS.deliverables, label: 'Deliverables', heading: 'What you walk away with.' },
  ],
};

export const testimonialsContent = {
  eyebrow: 'Testimonials',
  heading: 'Don’t take our word for it',
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
  pitches: {
    home: {
      headings: [
        'What are we building together?',
        'Got an idea that won’t let go?',
        'What’s your next big launch?',
        'Where is your business stuck?',
      ],
      intro:
        'Skip the perfect brief. Tell us what you want to happen, and we’ll come back with how to get there, how long it takes and what it costs.',
    },
    development: {
      headings: [
        'What should your product do next?',
        'What’s eating your team’s week?',
        'Got a vibe coded app to rescue?',
        'Where could AI save you hours?',
      ],
      intro:
        'Tell us what you want to launch or what keeps slowing you down. We’ll show you the fastest way to ship it, and where AI can take work off your plate.',
    },
    games: {
      headings: [
        'What game are we making?',
        'Got a game idea stuck in your head?',
        'Want players hooked on your brand?',
        'Ready to make it playable?',
      ],
      intro: 'A rough idea is plenty. Tell us who it’s for and what should make it fun, and we’ll come back with a plan you can play.',
    },
    marketing: {
      headings: [
        'Where are your leads leaking?',
        'Traffic, but no sales?',
        'Want a fuller sales calendar?',
        'Which channel actually pays?',
      ],
      intro:
        'Tell us what you sell and where it stalls. We’ll show you where the funnel leaks, and what we’d fix first to bring in more customers.',
    },
  },
  availability: 'Taking on new projects',
  steps: [
    { title: 'A reply from a real person', detail: 'Within two working days, from the person who would actually build it.' },
    { title: 'A quick call', detail: 'Thirty minutes to see if we’re the right team for this. No hard sell.' },
    { title: 'A plan with numbers in it', detail: 'What we’d build, how long it takes and what it costs, in writing.' },
  ],
  direct: { lead: 'Prefer email? Write to us at' },
  topics: {
    label: 'Closest to',
    optional: 'optional',
    options: [...services.map(({ slug, title }) => ({ value: slug, label: title })), { value: 'other', label: 'Something else' }],
  },
  fields: {
    name: { label: 'Name', placeholder: 'Your name', autoComplete: 'name' },
    email: { label: 'Email', placeholder: 'you@company.com', autoComplete: 'email' },
    company: { label: 'Company', optional: 'optional', placeholder: 'Where you work', autoComplete: 'organization' },
    message: { label: 'What you need', placeholder: 'What do you want to build, and what’s in the way?' },
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
    body: 'Got it. A real person reads every one of these, and you’ll hear back within two working days.',
    again: 'Send another',
  },
  failure: { title: 'That did not send.', body: 'Try again, or write to us directly.' },
};

export const notFoundContent = {
  eyebrow: '404',
  heading: 'This page wandered off.',
  action: 'Take me home',
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
