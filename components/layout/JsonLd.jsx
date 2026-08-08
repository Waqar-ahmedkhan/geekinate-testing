import { buildJsonLd } from '@/lib/seo';

export default function JsonLd({ id, nodes }) {
  const json = buildJsonLd(nodes);
  return <script id={id} type='application/ld+json' dangerouslySetInnerHTML={{ __html: json }} />;
}
