import { SITE } from '@/constants';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
