// PLACEHOLDER copy throughout. The structure is settled, the wording is not — needs sign-off before launch.

import { NAV_LINKS } from '@/constants';

// 02 · Featured Work ------------------------------------------------------------------------------------------------------------
// PLACEHOLDER: drafted 2026-08-11 from the four service pillars so the hero could be built against real line lengths. Every string
// here is up for replacement — they live in this one module precisely so rewriting the hero's voice never touches a component.
//
// `headline` splits deliberately. The reference sets the second half of its sentence at low opacity, and that only works if the copy
// is authored as two halves that each read on their own.
//
// There is no paragraph. The hero went from a two-column split to a top-to-bottom stack over the globe on 2026-08-13, and a body
// paragraph between the headline and the actions pushed the whole block down into the globe's own curve — the reference's hero is
// negative space above a horizon, which a third block of type is not.
// `pillars` is a list rather than the single eyebrow string it was, because each word is now a control: hovering one lights that
// quarter of the globe's network. The order is the order the anchors were dealt out to the four groups, so it is not free to change
// without saying which group each label means.
export const heroContent = {
  pillars: ['AI', 'Games', 'Marketing', 'Web'],
  headline: { lead: 'We build AI, games,', trail: 'and the web around them.' },
  actions: [
    { label: 'Start a project', href: '#contact', accent: true },
    { label: 'See the work', href: '#work', accent: false },
  ],
};

export const workContent = {
  eyebrow: '02 · Work',
  heading: 'Featured work.',
  allWork: { label: 'All work', href: '' },
};

// PLACEHOLDER projects. Six entries because the grid rhythm is 2+1 / 3 / 1+1+1 — dropping one leaves a hole in a row, so change the
// spans too if the count changes. `href` empty renders the tile as a plain div rather than a dead link.
//
// TEMPORARY MEDIA, two different kinds — check the prefix before reusing any of it elsewhere.
//   stokt-*   pulled from wearestokt.com to exercise the layout. Another studio's work. MUST NOT SHIP.
//   pexels-*  Pexels stock, free for commercial use with no attribution required. Safe to ship, but it is generic stock and says
//             nothing about Geekinate — replace with real case study footage. The number in the filename is the Pexels asset id.
//
// Encode every clip as H.264 (avc1) in MP4, or VP9 in WebM. One clip here was H.265/HEVC (hvc1) and rendered as a blank tile in
// Chrome on Windows, which cannot decode HEVC without Microsoft's paid extension. It fails silently — no console error, no media
// error event — so it reads as "not loading" rather than "unsupported codec".
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

// 03 · Services -----------------------------------------------------------------------------------------------------------------
export const servicesContent = {
  eyebrow: '03 · Services',
  heading: 'Four disciplines, one build team.',
  body: 'Every engagement ships running code, not a deck.',
};

// TEMPORARY MEDIA, two kinds — check the prefix.
//   stokt-*  three of these loops are wearestokt.com's own renders, used to prove out the interaction. Another studio's creative
//            work, and one carries their wordmark on a keycap. MUST NOT SHIP.
//   pexels-* Pexels stock, free for commercial use with no attribution. Safe to ship, but generic. The number is the asset id.
//
// The Marketing Systems card has no counterpart on the reference — Stokt runs three service cards, not four — so it takes a Pexels
// clip. The selection criterion is the other three cards' visual language, not the subject: one object, centred, studio-lit,
// nothing behind it. A clip of scattered arrows was tried first and rejected on sight — literally about marketing, but with no
// single subject it read as debris next to three product renders. Stock has no marketing-object render on black; match the
// language and let the copy carry the meaning.
//
// Swapping is a content edit: drop files in public/media/services/ and list them below. Each entry is { src, type }; give webm first
// and an mp4 fallback second, since Safari's webm support is unreliable. An empty sources array renders the "Media pending" panel.
export const services = [
  {
    slug: 'ai',
    title: 'AI & Automation',
    summary: 'Agents, pipelines, and internal tools that remove hours of manual work every week.',
    media: { sources: [{ src: '/media/services/robot-hand.webm', type: 'video/webm' }], poster: '' },
  },
  {
    slug: 'games',
    title: 'Games & Interactive',
    summary: 'Browser-native game mechanics that people finish, not bounce off.',
    media: { sources: [{ src: '/media/services/skate-wheel.webm', type: 'video/webm' }], poster: '' },
  },
  {
    slug: 'marketing',
    title: 'Marketing Systems',
    summary: 'Sites and funnels measured on pipeline, not page views.',
    media: { sources: [{ src: '/media/services/pexels-34742993-marketing.mp4', type: 'video/mp4' }], poster: '' },
  },
  {
    slug: 'web',
    title: 'Web Products',
    summary: 'Dashboards, portals, and platforms your team keeps using after launch.',
    media: { sources: [{ src: '/media/services/KEYCAPS-loop.webm', type: 'video/webm' }], poster: '' },
  },
];

// 04 · Testimonials -------------------------------------------------------------------------------------------------------------
// The asterisk-and-footnote device is the reference's; the words are ours and still placeholder. The asterisk is rendered in volt
// by the section, so `heading` carries the sentence without it.
export const testimonialsContent = {
  eyebrow: '04 · Testimonials',
  heading: 'Do not take our word for it',
  footnote: '*Take theirs',
};

// PLACEHOLDER testimonials — twelve of them, because the drifting row needs enough cards to fill a wide viewport twice over and
// the stagger sequence in TestimonialMarquee is written for twelve. Names, roles and companies are invented and must be replaced
// with real, cleared quotes.
//
// Quote lengths are uneven on purpose — equal-length cards flatten the stagger into a strip — but they have a floor. A one-line
// quote leaves a stub card marooned in its 520px slot, and the row reads as holes rather than rhythm. Keep every quote to roughly
// four lines or more; when real quotes come in, pad the short ones with context rather than shipping them as they are.
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

// Contact ----------------------------------------------------------------------------------------------------------------------
// Section 05, and the target the hero's primary action, the navbar's call to action and the navbar's Contact link have all been
// pointing at. Every string the form can put on screen lives here rather than in the component, including the validation messages:
// they are copy the reader reads, not control flow, and a message that says what to do about the problem has to be written like the
// rest of the page rather than typed inline next to the regex that produced it.
export const contactContent = {
  eyebrow: '05 · Contact',
  heading: 'Tell us what you are trying to build',
  fields: {
    name: { label: 'Name', placeholder: 'Your name', autoComplete: 'name' },
    email: { label: 'Email', placeholder: 'you@company.com', autoComplete: 'email' },
    company: { label: 'Company', optional: 'optional', placeholder: 'Where you work', autoComplete: 'organization' },
    message: { label: 'What you need', placeholder: 'What you are building, and what is in the way of it.' },
  },
  // Cause and fix in one line each. "Required" says what the form wants and nothing about what the reader should do next.
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

// Footer ------------------------------------------------------------------------------------------------------------------------
export const footerContent = {
  // PLACEHOLDER: wearestokt.com carries a city line here. Confirm what Geekinate should say before launch.
  location: 'Remote — Worldwide',
  rights: 'All rights reserved.',
};

// Two columns now, not the reference's four. Socials left the grid on 2026-08-20 to become the icon row along the foot of the panel,
// and Legal folded into Quick links behind it: two pages do not earn a heading of their own, and a column holding only them next to
// one holding five reads as a gap rather than as a pair.
//
// Quick links is the site's own navigation plus those two; Services is derived from the pillars above so the two lists cannot drift.
// Legal has no pages yet — an empty href renders as plain text rather than a dead link.
export const footerColumns = [
  {
    title: 'Quick links',
    links: [{ label: 'Home', href: '/' }, ...NAV_LINKS, { label: 'Privacy Policy', href: '' }, { label: 'Terms of Service', href: '' }],
  },
  { title: 'Services', links: services.map(({ title }) => ({ label: title, href: '#services' })) },
];

// TEMPORARY MEDIA — MUST NOT SHIP. wearestokt.com's own footer render, pulled to prove out the panel; their wordmark is printed on
// the golf balls. Replace with a Geekinate render before this goes anywhere public.
//
// WebM only, so Safari will fall through to the black panel. Add an H.264 MP4 alongside it when the real clip lands.
export const footerMedia = {
  sources: [{ src: '/media/footer/stokt-golf-ball-render.webm', type: 'video/webm' }],
  poster: '',
};
