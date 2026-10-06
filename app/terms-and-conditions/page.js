import Legal from '@/features/legal';
import { buildMetadata } from '@/lib/seo';
import { legalPages } from '@/lib/content';

const { terms } = legalPages;

export const metadata = buildMetadata({ title: terms.title, description: terms.summary, path: terms.path });

export default function TermsPage() {
  return <Legal page={terms} />;
}
