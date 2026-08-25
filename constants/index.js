export * from './cosmos';
export * from './globe';
export * from './grain';
export * from './lab';
export * from './marquee';
export * from './preloader';
export * from './snake';
export * from './substrate';

export const SITE = {
  name: 'Geekinate',
  description: 'Geekinate builds AI automation, games, marketing systems, and web products. Real builders, not a template factory.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  ogImage: '/images/openGraph.png',
  email: 'hello@geekinate.com',
};

export const LAYOUT = { container: 1440 };

export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/geekinate' },
  { label: 'GitHub', href: 'https://github.com/geekinate' },
  { label: 'Twitter', icon: 'X', href: 'https://x.com/geekinate' },
];
