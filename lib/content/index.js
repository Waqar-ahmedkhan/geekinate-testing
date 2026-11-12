import { replyWindow, serviceNames } from './shared';
import { partnerHero } from './partner';
import { LEGAL, NAV_LINKS, PARTNER, SERVICE_SECTIONS, SITE } from '@/constants';

export * from './legal';
export * from './partner';
export * from './shared';
export * from './work';

export const homeMeta = {
  description:
    'We build websites, apps, games and AI tools, and help customers find you through marketing. Explore Geekinate’s work and tell us what you need.',
};

export const heroContent = {
  headline: { lead: 'One team to build it,', trail: 'launch it and grow it.' },
  body: 'We build websites, apps, games and AI tools, and help customers find you.',
  actions: [
    { label: 'Let’s talk', href: '#contact', accent: true },
    { label: 'See our work', href: '#work', accent: false },
  ],
};

export const clientsContent = {
  heading: 'A few of the teams we’ve worked with.',
};

export const clients = [
  { name: 'Space Manager', src: '/media/clients/space-manager.webp', width: 997, size: 28 },
  { name: 'LVL AZN', src: '/media/clients/lvl-azn.webp', width: 199, size: 52 },
  { name: 'Twinhub', src: '/media/clients/twinhub.webp', width: 694, size: 32 },
  { name: 'Elevé', src: '/media/clients/eleve-mark.webp', width: 119, size: 58 },
  { name: 'Central Pediatrics', src: '/media/clients/central-pediatrics.webp', width: 619, size: 34 },
  { name: 'Lilia', src: '/media/clients/lilia.webp', width: 449, size: 44 },
  { name: 'Aroma Farmacy', src: '/media/clients/aroma-farmacy.webp', width: 784, size: 30 },
  { name: 'LinkTax Accountants', src: '/media/clients/link-tax.webp', width: 355, size: 44 },
];

export const servicesContent = {
  eyebrow: 'Services',
  heading: 'What can we help you with?',
  body: 'Bring us one part of the job, or let us connect the whole thing.',
};

export const services = [
  {
    slug: 'development',
    title: serviceNames.development.title,
    summary: 'We build websites, apps and AI tools that help you serve customers and get work done.',
    media: { sources: [{ src: '/media/services/ai.mp4', type: 'video/mp4' }], poster: '/media/services/ai.webp', loop: false },
    headline: { lead: 'Launch faster.', mark: 'Automate', trail: 'the rest.' },
    lead: 'From a first MVP to an AI agent that answers your customers at 3am, we design, build and ship software that gives your team hours back every week and gives your customers a reason to stay.',
    scopeIntro: 'Pick a starting point, or bring us the problem nobody else wanted to touch.',
    facts: [],
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
    title: serviceNames.games.title,
    summary: 'We create games, AR and VR experiences that people can play, explore and interact with.',
    media: { sources: [{ src: '/media/services/game.mp4', type: 'video/mp4' }], poster: '/media/services/game.webp', loop: false },
    headline: { lead: 'Games people', mark: 'can’t put down,', trail: 'and can’t stop sharing.' },
    lead: 'Branded browser games, mobile AR and full VR worlds. We build playable experiences that grab attention in seconds, keep players coming back, and put your brand in their group chat.',
    scopeIntro: 'Got a game in your head? Here is how it gets out.',
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
    title: serviceNames.marketing.title,
    summary: 'We help customers find you through search, ads and content—and make it easier for them to enquire or buy.',
    media: {
      sources: [{ src: '/media/services/marketing.mp4', type: 'video/mp4' }],
      poster: '/media/services/marketing.webp',
      loop: false,
    },
    headline: { lead: 'We help customers find you—and give them', mark: 'a reason to choose you.', trail: '' },
    lead: 'We help you show up in search, run ads and create content that explains why people should choose your business. We also improve your website and follow-up, so interested visitors can take the next step.',
    scopeIntro:
      'Maybe you need more people finding you. Maybe they’re visiting but not buying. Or enquiries are coming in, but the follow-up isn’t happening. We’ll help you work out what needs attention first.',
    sections: {
      scope: { label: 'How we help', heading: 'Where could you use a hand?' },
      deliverables: { intro: 'For the work we agree on, here’s what you’ll have to show for it.' },
      process: {
        label: 'How we work',
        heading: 'How we’ll work together.',
        intro: 'Need help with one thing or someone to keep it moving each month? We’ll agree on what makes sense for your business.',
      },
    },
    facts: [],
    scope: [
      {
        title: 'SEO & content',
        detail:
          'We improve your website and create content around your customers’ questions, helping you show up when people look for what you sell.',
      },
      {
        title: 'Paid ads',
        detail:
          'We get your offer in front of the right people with ads and matching landing pages, then track which campaigns bring useful enquiries or sales.',
      },
      {
        title: 'Websites & landing pages',
        detail:
          'We help visitors take the next step with pages that explain what you do, answer their questions and make it easy to enquire, book or buy.',
      },
      {
        title: 'Email & follow-up',
        detail:
          'We keep the conversation going after the first enquiry with emails and reminders, so your team knows who needs a reply and what happens next.',
      },
      {
        title: 'Tracking & reporting',
        detail:
          'We connect your website, campaigns and sales tools to show what your marketing brings in—from enquiry sources to customers, where the data allows.',
      },
      {
        title: 'Testing & improvement',
        detail:
          'We test headlines, offers and forms to find out what gets more people to act, then use what we learn to improve your pages and campaigns.',
      },
    ],
    steps: [
      { title: 'First, we listen.', detail: 'Tell us what you sell, how customers find you today and what isn’t working.' },
      {
        title: 'Then, we agree on what to fix.',
        detail: 'You’ll know what we’re doing, what it costs and how we’ll judge whether it’s helping.',
      },
      { title: 'We get to work.', detail: 'We create the content, launch the campaigns and make the website changes we’ve agreed on.' },
      {
        title: 'We look at what happens next.',
        detail: 'We review the results with you. If you want ongoing help, we agree on what to test and improve each month.',
      },
    ],
    deliverables: [
      {
        title: 'Checked',
        detail: 'We test the parts we build—from the page to the enquiry and follow-up—before we call them done.',
      },
      { title: 'Yours', detail: 'Your team has access to the accounts, content and data used for your work, with a clear handover.' },
      {
        title: 'Clear',
        detail: 'A simple view of the enquiries and sales we can track, with an honest explanation of what the numbers cannot show.',
      },
      { title: 'Next', detail: 'A short, prioritized list of what to improve after launch, based on what we’ve learned.' },
    ],
  },
];

const workAction = { label: 'See our work', href: '/#work' };
const serviceActions = [{ label: 'Let’s talk', href: '#contact', accent: true }, workAction];

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
        'Got an idea you can’t stop thinking about?',
        'What are you launching next?',
        'What’s slowing your business down?',
      ],
      intro: 'No finished brief needed. Tell us what you have in mind and where you’re stuck.',
    },
    development: {
      headings: ['What would you like to build—or make work better?'],
      intro:
        'Tell us what you want to launch or what keeps slowing you down. We’ll talk through what needs building and whether automation or AI would help.',
    },
    games: {
      headings: ['Have an idea people could play, explore or interact with?'],
      intro:
        'A rough idea is plenty. Tell us who it’s for and what should make it fun. We’ll talk through the platform, scope and next step.',
    },
    marketing: {
      eyebrow: 'Let’s talk',
      headings: ['What would you like your marketing to do better?'],
      intro:
        'More enquiries? More bookings? More people buying from your website? Tell us a little about your business and what’s getting in the way. You don’t need a finished brief—we’ll work through it with you.',
    },
  },
  availability: 'Taking on new projects',
  next: `We’ll reply within ${replyWindow}, talk it through, and outline the work, timing and cost before you decide.`,
  direct: { lead: 'Prefer email? Write to us at' },
  interests: {
    label: 'What would you like help with?',
    optional: 'optional',
    placeholder: 'Choose one',
    options: [
      'Getting found',
      'Running ads',
      'Improving my website',
      'Following up with leads',
      'Understanding what’s working',
      'Not sure yet',
    ],
  },
  fields: {
    name: { label: 'Your name', placeholder: 'Your name', autoComplete: 'name' },
    email: { label: 'Email', placeholder: 'you@company.com', autoComplete: 'email' },
    company: { label: 'Website or company', optional: 'optional', placeholder: 'yourcompany.com', autoComplete: 'organization' },
    message: {
      label: 'Tell us a little more',
      placeholder: 'Tell us what you’re working on, what you’d like to change, or where you’re stuck.',
    },
  },
  errors: {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address.',
    emailShape: 'Please enter a valid email address.',
    message: 'Tell us a little about what you need.',
    messageShort: 'A little more detail, so the reply is worth reading.',
  },
  submit: { idle: 'Send enquiry', pending: 'Sending' },
  success: {
    title: 'Message sent',
    body: `Thanks—your enquiry is with us. We’ll get back to you within ${replyWindow}.`,
    again: 'Send another',
  },
  failure: { title: 'We couldn’t send your enquiry.', body: `Please try again, or email ${SITE.email}.` },
  confirmation: {
    subject: 'We’ve got your message',
    greeting: 'Hi',
    intro: `Thanks for getting in touch. A real person reads every one of these, and you’ll hear back within ${replyWindow}.`,
    quoted: 'Here’s what you sent',
    outro: 'Want to add something? Just reply to this email.',
    action: workAction,
    signoff: 'The Geekinate team',
    note: 'You’re getting this because you sent an enquiry through',
  },
  enquiry: {
    subject: 'New project enquiry from',
    heading: 'New enquiry from',
    labels: { from: 'From', email: 'Email', company: 'Company', topic: 'Service', interests: 'Interested in' },
    message: 'Message',
    reply: 'Reply to',
    note: 'Sent from the contact form on',
    replyNote: 'Replying to this email answers them directly.',
  },
};

export const notFoundContent = {
  eyebrow: '404',
  heading: 'This page wandered off.',
  action: 'Take me home',
};

export const footerContent = {
  location: 'Remote — Worldwide',
  rights: 'All rights reserved.',
  partner: {
    eyebrow: partnerHero.eyebrow,
    text: `${partnerHero.headline.lead} ${partnerHero.headline.trail}`,
    cta: 'Partner with us',
    href: PARTNER.path,
  },
};

export const footerColumns = [
  {
    title: 'Quick links',
    links: [
      { label: 'Home', href: '/' },
      ...NAV_LINKS,
      { label: 'Privacy Policy', href: LEGAL.privacy },
      { label: 'Terms & Conditions', href: LEGAL.terms },
    ],
  },
  { title: 'Services', links: services.map(({ slug, title }) => ({ label: title, href: `/services/${slug}` })) },
];

export const footerMedia = {
  sources: [{ src: '/media/footer/stokt-golf-ball-render.webm', type: 'video/webm' }],
  poster: '',
};
