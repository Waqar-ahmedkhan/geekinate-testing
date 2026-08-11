import Hero from '@/features/hero';
import Work from '@/features/work';
import Services from '@/features/services';
import Testimonials from '@/features/testimonials';

export default function Home() {
  return (
    <main className='flex-1'>
      <Hero />
      <Work />
      <Services />
      <Testimonials />
    </main>
  );
}
