import { notFound } from 'next/navigation';
import { CtaBand, HydrationSplit, JsonLd } from '@/components';
import ServiceHero from '@/features/service-hero';
import ServiceDossier from '@/features/service-dossier';
import Contact from '@/features/contact';
import { HeroSheet } from '@/lib/ui/reusable_components';
import { buildMetadata, buildServiceJsonLd } from '@/lib/seo';
import { servicePageContent, services } from '@/lib/content';

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
  const { actions } = servicePageContent;
  return (
    <main className='flex-1'>
      <JsonLd id={`json-ld-service-${slug}`} nodes={[buildServiceJsonLd(service)]} />
      <HeroSheet hero={<ServiceHero service={service} />}>
        <HydrationSplit>
          <ServiceDossier service={service} />
          <CtaBand headline={service.handoff} actions={actions} />
          <Contact topic={slug} />
        </HydrationSplit>
      </HeroSheet>
    </main>
  );
}
