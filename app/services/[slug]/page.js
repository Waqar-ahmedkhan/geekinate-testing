import { notFound } from 'next/navigation';
import { CtaBand, JsonLd } from '@/components';
import ServiceHero from '@/features/service-hero';
import ServiceDossier from '@/features/service-dossier';
import Blueprint from '@/features/blueprint';
import Contact from '@/features/contact';
import { buildMetadata, buildServiceJsonLd } from '@/lib/seo';
import { blueprintFor, servicePageContent, services } from '@/lib/content';

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
  const { handoff } = servicePageContent;
  const blueprint = blueprintFor(slug);
  return (
    <main className='flex-1'>
      <JsonLd id={`json-ld-service-${slug}`} nodes={[buildServiceJsonLd(service)]} />
      <ServiceHero service={service} />
      <ServiceDossier service={service} />
      {blueprint ? <Blueprint content={blueprint} /> : null}
      <CtaBand headline={handoff.headline} actions={handoff.actions} />
      <Contact />
    </main>
  );
}
