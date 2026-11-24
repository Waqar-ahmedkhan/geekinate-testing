export const copy = {
  intro: ['Welcome to Geekinate.', 'Four makers, three disciplines, one living fieldbook.'],
  origin: ['It starts with a single notebook.', 'From first sketches to shipped systems.'],
  engineering: ['Design meets engineering.', 'Full-stack software and AI under one roof.'],
  growth: ['Built to reach real people.', 'Strategy, marketing, and delivery align.'],
  interactive: ['Beyond flat screens.', 'Games, 3D motion, and playable worlds.'],
  studio: ['Four makers. One studio.', 'The next chapter starts with your project.'],
};

export const beats = {
  intro: {
    headline: 'Welcome to Geekinate.',
    narration: 'Development & AI, Games & Interactive, and Marketing — four makers, one living fieldbook.',
    artifact: '',
  },
  origin: {
    headline: 'It starts in the fieldbook.',
    narration: 'Hamza opens the first studio notebook and turns rough briefs into sharp visual systems.',
    artifact: '',
  },
  engineering: {
    headline: 'Design meets AI & engineering.',
    narration: 'Bilal drops in to build scalable web platforms and AI-powered products.',
    artifact: '',
  },
  growth: {
    headline: 'Built to reach real people.',
    narration: 'Zain brings marketing strategy and delivery: great work meets real growth.',
    artifact: '',
  },
  interactive: {
    headline: 'Playable, tactile, alive.',
    narration: 'Rayan takes over interactive: AR/VR games, 3D motion, and playable web worlds.',
    artifact: '',
  },
  studio: {
    headline: 'Meet the Geekinate crew.',
    narration: 'Seven years, three core disciplines, a brand-new site. Meet the team.',
    artifact: '',
  },
};

export const pillars = [
  {
    title: 'Development & AI',
    body: 'Custom web platforms, AI workflows, and fast production software built directly by the makers you talk to.',
  },
  {
    title: 'Games & Interactive',
    body: 'Playable AR/VR games, WebGL motion, and tactile 3D experiences crafted to hold attention.',
  },
  {
    title: 'Marketing',
    body: 'Clear positioning, campaigns, and conversion systems — driving results like 5× online giving growth for Shifa Foundation USA.',
  },
];

export const milestonePolaroids: Record<string, { src: string; caption: string; kind?: 'photo' | 'crew' }> = {
  origin: { src: '/media/fieldbook/photos/usama.jpg', caption: 'HAMZA, THE FIRST PENCIL STROKE', kind: 'photo' },
  'adil-joins': { src: '/media/fieldbook/photos/adil.jpg', caption: 'BILAL JOINS THE BUILD', kind: 'photo' },
  'twinhub-launch': { src: '/media/work/twinhub-site.webp', caption: 'TWINHUB, LIVE', kind: 'photo' },
  'nouman-joins': { src: '/media/fieldbook/photos/nouman.jpg', caption: 'ZAIN, STRATEGY & GROWTH', kind: 'photo' },
  'shifa-growth': { src: '/media/work/shifa.webp', caption: 'SHIFA FOUNDATION USA', kind: 'photo' },
  'waqar-joins': { src: '/media/fieldbook/photos/waqar.jpg', caption: 'RAYAN, PLAYABLE WORLDS', kind: 'photo' },
  'geekinate-v2': { src: '/media/hero/globe-phone.webp', caption: 'FIRST SESSION, ALL FOUR OF US', kind: 'crew' },
};

export const achievements = [
  { value: 5, suffix: '×', label: 'Online giving growth', detail: 'Shifa Foundation USA reached 5× its starting monthly online giving.' },
  { value: 3, suffix: '', label: 'Core disciplines', detail: 'Development & AI, Games & Interactive, and Marketing under one roof.' },
  { value: 4, suffix: '', label: 'Makers', detail: 'You talk directly to the people building your work.' },
  { value: 1, suffix: ' day', label: 'Reply window', detail: 'Every enquiry gets an answer within one working day.' },
];

export const trajectory = {
  title: 'Geekinate’s growth trajectory',
  intro:
    'From the first design notebook to a studio bringing design, engineering, marketing and interactive work together. Follow the decisions, people and projects that shaped each step.',
  changeLabel: 'What changed',
};
