import { preload } from 'react-dom';
import Hero from '@/features/hero';
import Clients from '@/features/clients';
import Work from '@/features/work';
import Services from '@/features/services';
import Testimonials from '@/features/testimonials';
import Contact from '@/features/contact';
import { HydrationSplit } from '@/components';
import { PHONE } from '@/constants';

export default function Home() {
  preload(PHONE.still.href, { as: 'image', type: PHONE.still.type, media: PHONE.query, fetchPriority: 'high' });
  return (
    <main className='flex-1'>
      <Hero />
      <HydrationSplit>
        <Clients />
        <Work />
        <Services />
        <Testimonials />
        <Contact />
      </HydrationSplit>
    </main>
  );
}
