import Hero from '@/features/hero';
import Clients from '@/features/clients';
import Work from '@/features/work';
import Services from '@/features/services';
import Testimonials from '@/features/testimonials';
import Contact from '@/features/contact';

export default function Home() {
  return (
    <main className='flex-1'>
      <Hero />
      <Clients />
      <Work />
      <Services />
      <Testimonials />
      <Contact />
    </main>
  );
}
