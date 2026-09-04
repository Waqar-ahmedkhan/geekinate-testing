import { services } from '@/lib/content';
import { PARTNER, SITE } from '@/constants';

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
  const partner = { url: toAbsolute(PARTNER.path), lastModified, changeFrequency: 'monthly', priority: 0.8 };
  return [home, ...servicePages, partner];
}
