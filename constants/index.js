export * from './cosmos';
export * from './lab';
export * from './snake';

export const SITE = {
  name: 'Geekinate',
  description: 'Geekinate builds AI automation, games, marketing systems, and web products. Real builders, not a template factory.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  ogImage: '/images/openGraph.png',
  // PLACEHOLDER: confirm the public contact address before launch.
  email: 'hello@geekinate.com',
};

// The container the hero composes inside. Single source: the navbar animates its rail to this width, the hero caps its grid at it,
// and the particle scene measures the mark's offset against it — three places that have to agree or the mark drifts out of the
// column the copy is in.
export const LAYOUT = { container: 1440 };

export const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
];

// PLACEHOLDER: swap for the real profiles before launch.
export const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/geekinate' },
  { label: 'GitHub', href: 'https://github.com/geekinate' },
  { label: 'X', href: 'https://x.com/geekinate' },
];
