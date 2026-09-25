import { notFound } from 'next/navigation';
import { JsonLd } from '@/components';
import CaseHero from '@/features/case-hero';
import CaseStudy from '@/features/case-study';
import Contact from '@/features/contact';
import { buildCaseStudyJsonLd, buildMetadata } from '@/lib/seo';
import { work } from '@/lib/content';

export const dynamicParams = false;

const findProject = (slug) => work.find((project) => project.slug === slug);

export function generateStaticParams() {
  return work.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  return buildMetadata({ title: project.title, description: project.summary, path: project.href });
}

export default async function WorkPage({ params }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();
  return (
    <main className='flex-1'>
      <JsonLd id={`json-ld-work-${slug}`} nodes={[buildCaseStudyJsonLd(project)]} />
      <CaseHero project={project} />
      <CaseStudy project={project} />
      <Contact />
    </main>
  );
}
