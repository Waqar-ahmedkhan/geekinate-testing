import Hero from '@/features/hero';
import Clients from '@/features/clients';
import Work from '@/features/work';
import Services from '@/features/services';
import Testimonials from '@/features/testimonials';
import Cta from '@/features/cta';
import Contact from '@/features/contact';
import { HydrationSplit } from '@/components';

export default function Home() {
  return (
    <main className='flex-1'>
      <Hero />
      <HydrationSplit>
        <Clients />
        <Work />
        <Services />
        <Testimonials />
        <Cta />
        <Contact />
      </HydrationSplit>
    </main>
  );
}
