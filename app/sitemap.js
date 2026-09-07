import { PARTNER, SITE } from '@/constants';

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: new URL(PARTNER.path, SITE.url).toString(), lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
