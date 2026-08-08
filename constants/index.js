export const SITE = {
  name: 'Geekinate',
  description: 'Geekinate builds AI automation, games, marketing systems, and web products. Real builders, not a template factory.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locale: 'en_US',
  ogImage: '/images/openGraph.png',
  // PLACEHOLDER: confirm the public contact address before launch.
  email: 'hello@geekinate.com',
};

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
