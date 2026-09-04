import { notFound } from 'next/navigation';
import { JsonLd } from '@/components';
import ServiceMasthead from '@/features/service-masthead';
import ServiceDossier from '@/features/service-dossier';
import Contact from '@/features/contact';
import { buildMetadata, buildServiceJsonLd } from '@/lib/seo';
import { services } from '@/lib/content';

export const dynamicParams = false;

const findService = (slug) => services.find((service) => service.slug === slug);

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) return {};
  return buildMetadata({ title: service.title, description: service.summary, path: `/services/${slug}` });
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();
  return (
    <main className='flex-1'>
      <JsonLd id={`json-ld-service-${slug}`} nodes={[buildServiceJsonLd(service)]} />
      <ServiceMasthead service={service} />
      <ServiceDossier service={service} />
      <Contact className='max-w-none' />
    </main>
  );
}
