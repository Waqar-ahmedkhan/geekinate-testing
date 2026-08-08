import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Section, SectionHead } from '@/components';

export const metadata = { title: 'Page not found', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className='flex-1'>
      <Section>
        <div className='flex flex-col items-start gap-6'>
          <SectionHead as='h1' eyebrow='404' heading='That page does not exist.' className='mb-0' />
          <Button asChild size='lg' className='rounded-full shadow-brutal'>
            <Link href='/'>Back to home</Link>
          </Button>
        </div>
      </Section>
    </main>
  );
}
