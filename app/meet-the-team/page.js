import Contact from '@/features/contact';
import Team from '@/features/team';
import { buildMetadata } from '@/lib/seo';
import { teamContent } from '@/lib/content/team';

export const metadata = {
  ...buildMetadata({ ...teamContent.meta, path: teamContent.path }),
  robots: { index: false, follow: true },
};

export default function TeamPage() {
  return (
    <main>
      <Team />
      <Contact />
    </main>
  );
}
