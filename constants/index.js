export * from './ai';
export * from './circuit';
export * from './cosmos';
export * from './cta';
export * from './dice';
export * from './globe';
export * from './grain';
export * from './lab';
export * from './marquee';
export * from './partner';
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
    'Geekinate builds AI products, games and marketing systems that win customers. One team from first idea to launch, and long after it.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  ogImage: '/images/openGraph.png',
  email: 'hello@geekinate.com',
};

export const LAYOUT = { container: 1440 };

export const TYPED = { startMs: 2600, typeMs: 55, eraseMs: 28, holdMs: 3400, restMs: 700 };

export const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'Work', href: '/#work' },
  { label: 'Process', href: '/#process' },
  { label: 'Contact', href: '/#contact' },
];

export const NAV_CTA = { label: 'Start a project', href: '/#contact' };

export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/geekinate' },
  { label: 'GitHub', href: 'https://github.com/geekinate' },
  { label: 'Twitter', icon: 'X', href: 'https://x.com/geekinate' },
];
