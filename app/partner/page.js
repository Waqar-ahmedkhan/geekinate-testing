import Partner from '@/features/partner';
import { JsonLd } from '@/components';
import { buildFaqJsonLd, buildMetadata } from '@/lib/seo';
import { partnerFaq, partnerMeta } from '@/lib/content';
import { PARTNER } from '@/constants';

export const metadata = {
  ...buildMetadata({ title: partnerMeta.title, description: partnerMeta.description, path: PARTNER.path }),
  robots: { index: true, follow: true },
};

export default function PartnerPage() {
  return (
    <>
      <JsonLd id='json-ld-partner' nodes={[buildFaqJsonLd(partnerFaq.items)]} />
      <Partner />
    </>
  );
}
