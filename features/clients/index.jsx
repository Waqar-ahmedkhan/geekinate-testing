import { Section, SectionHead } from '@/components';
import { ClientLogo, Marquee } from '@/lib/ui/reusable_components';
import { clients, clientsContent } from '@/lib/content';

export default function Clients() {
  const { heading } = clientsContent;
  const logoEls = clients.map(({ name, src, width, size }) => <ClientLogo key={name} name={name} src={src} width={width} size={size} />);
  return (
    <Section id='clients' variant='paper' className='px-0 py-20 md:px-0 md:py-20'>
      <SectionHead heading={heading} className='px-6 md:px-10' />
      <Marquee>{logoEls}</Marquee>
    </Section>
  );
}
