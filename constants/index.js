export * from './ai';
export * from './circuit';
export * from './cosmos';
export * from './cta';
export * from './dice';
export * from './email';
export * from './globe';
export * from './grain';
export * from './lab';
export * from './marquee';
export * from './partner';
export * from './phone';
export * from './preloader';
export * from './process';
export * from './sheet';
export * from './snake';
export * from './substrate';
export * from './video';
export * from './work';

export const SITE = {
  name: 'Geekinate',
  description:
    'Geekinate builds websites, software and games, uses AI to take repetitive work off your team, and helps customers find you through search, ads and content.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  ogImage: '/images/openGraph.png',
  email: 'hello@geekinate.com',
};

export const LAYOUT = { container: 1440 };

export const TYPED = { startMs: 2600, typeMs: 55, eraseMs: 28, holdMs: 4000, restMs: 700 };

export const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Contact', href: '/#contact' },
];

export const NAV_CTA = { label: 'Let’s talk', href: '/#contact', local: '#contact' };

export const CONTACT_ROUTES = ['/services/', '/work/'];

export const LEGAL = { privacy: '/privacy-policy', terms: '/terms-and-conditions' };

const LINKEDIN = { label: 'LinkedIn', href: 'https://www.linkedin.com/company/geekinate' };

export const SOCIALS = [
  LINKEDIN,
  { label: 'GitHub', href: 'https://github.com/geekinate' },
  { label: 'Twitter', icon: 'X', href: 'https://x.com/geekinate' },
];

export const MAIL_SOCIALS = [LINKEDIN, { label: 'Instagram', href: 'https://www.instagram.com/geekinate/' }];
