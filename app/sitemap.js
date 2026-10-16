import { legalPages, services, work } from '@/lib/content';
import { PARTNER, SITE } from '@/constants';

export const dynamic = 'force-static';

const toAbsolute = (path) => new URL(path, SITE.url).toString();

export default function sitemap() {
  const lastModified = new Date();
  const home = { url: SITE.url, lastModified, changeFrequency: 'weekly', priority: 1 };
  const servicePages = services.map(({ slug }) => ({
    url: toAbsolute(`/services/${slug}`),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  const workPages = work.map(({ href }) => ({ url: toAbsolute(href), lastModified, changeFrequency: 'monthly', priority: 0.7 }));
  const partner = { url: toAbsolute(PARTNER.path), lastModified, changeFrequency: 'monthly', priority: 0.8 };
  const legal = Object.values(legalPages).map(({ path }) => ({
    url: toAbsolute(path),
    lastModified,
    changeFrequency: 'yearly',
    priority: 0.3,
  }));
  return [home, ...servicePages, ...workPages, partner, ...legal];
}
