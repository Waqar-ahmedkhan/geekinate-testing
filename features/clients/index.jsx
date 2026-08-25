import { Section, SectionHead } from '@/components';
import { ClientLogo, Marquee } from '@/lib/ui/reusable_components';
import { clients, clientsContent } from '@/lib/content';

export default function Clients() {
  const { eyebrow, heading } = clientsContent;
  const logoEls = clients.map((name, index) => <ClientLogo key={name} name={name} index={index} />);
  return (
    <Section id='clients' variant='paper' className='px-0 py-20 md:px-0 md:py-20'>
      <SectionHead eyebrow={eyebrow} heading={heading} className='px-6 md:px-10' />
      <Marquee>{logoEls}</Marquee>
    </Section>
  );
}
