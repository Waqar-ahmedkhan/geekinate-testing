import { SITE, SOCIALS } from '@/constants';

const toAbsolute = (path = '/') => new URL(path, SITE.url).toString();

export const buildMetadata = ({ title, description, path = '/', image = SITE.ogImage }) => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    title,
    description,
    url: toAbsolute(path),
    siteName: SITE.name,
    locale: SITE.locale,
    type: 'website',
    images: [{ url: toAbsolute(image), width: 1200, height: 630, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: [toAbsolute(image)] },
});

export const organizationJsonLd = {
  '@type': 'Organization',
  '@id': toAbsolute('/#organization'),
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  email: SITE.email,
  logo: toAbsolute('/brand/geekinate-appicon-512.png'),
  sameAs: SOCIALS.map(({ href }) => href),
};

export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': toAbsolute('/#website'),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': organizationJsonLd['@id'] },
};

export const buildServiceJsonLd = ({ slug, title, summary }) => ({
  '@type': 'Service',
  '@id': toAbsolute(`/services/${slug}/#service`),
  name: title,
  description: summary,
  url: toAbsolute(`/services/${slug}`),
  provider: { '@id': organizationJsonLd['@id'] },
});

export const buildJsonLd = (nodes) => JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
