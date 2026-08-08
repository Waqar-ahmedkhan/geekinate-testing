import { SITE } from '@/constants';

// Add an entry here whenever a route is created — nothing is discovered automatically.
export default function sitemap() {
  const lastModified = new Date();
  return [{ url: SITE.url, lastModified, changeFrequency: 'weekly', priority: 1 }];
}
