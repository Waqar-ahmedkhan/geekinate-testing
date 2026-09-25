import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section, SectionHead } from '@/components';
import { notFoundContent } from '@/lib/content';

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } };

export default function NotFound() {
  const { eyebrow, heading, action } = notFoundContent;
  return (
    <main className='flex-1'>
      <Section>
        <div className='flex flex-col items-start gap-6'>
          <SectionHead as='h1' eyebrow={eyebrow} heading={heading} className='mb-0' />
          <Button asChild size='lg' className='rounded-full shadow-brutal'>
            <Link href='/'>{action}</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}
