import Legal from '@/features/legal';
import { buildMetadata } from '@/lib/seo';
import { legalPages } from '@/lib/content';

const { privacy } = legalPages;

export const metadata = buildMetadata({ title: privacy.title, description: privacy.summary, path: privacy.path });

export default function PrivacyPage() {
  return <Legal page={privacy} />;
}
