import BackgroundLab from '@/features/lab';

// Not part of the site. A prototype route so the background can be seen and judged before anything is wired into the pages, and the
// one place where a design question gets answered by looking rather than by describing.
export const metadata = { title: 'Background prototype', robots: { index: false, follow: false } };

export default function LabPage() {
  return <BackgroundLab />;
}
