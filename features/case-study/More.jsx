import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHead } from '@/components';
import { WorkTile } from '@/lib/ui/reusable_components';
import { work } from '@/lib/content';
import { WORK } from '@/constants';

const ALL_WORK =
  'group -my-2 flex shrink-0 items-center gap-2 py-2 font-mono text-xs uppercase tracking-[0.18em] text-mut transition-colors duration-200 hover:text-foreground';
const TILE_SHAPE = 'aspect-[3/2]';
const LEAD_SHAPE = 'aspect-[3/2] sm:col-span-2 sm:aspect-[2/1] lg:col-span-2 lg:aspect-[3/2]';

const relatedTo = (projects, slug) => {
  const index = projects.findIndex((project) => project.slug === slug);
  return [...projects.slice(index + 1), ...projects.slice(0, index)].slice(0, WORK.related);
};

export default function More({ block, slug }) {
  const { label, heading, all } = block;
  const tileEls = relatedTo(work, slug).map(({ slug: key, title, disciplines, href, media, hoverMedia }, index) => (
    <WorkTile
      key={key}
      title={title}
      disciplines={disciplines}
      span={2}
      href={href}
      media={media}
      hoverMedia={hoverMedia}
      className={index ? TILE_SHAPE : LEAD_SHAPE}
    />
  ));
  return (
    <Section id={block.id} variant='paper' compact className='border-b-[1.5px] border-line py-24 md:py-32'>
      <div className='mx-auto flex w-full max-w-6xl flex-col'>
        <div className='mb-8 flex items-end justify-between gap-6 md:mb-10'>
          <SectionHead eyebrow={label} heading={heading} className='mb-0 md:mb-0' />
          <Link href={all.href} className={ALL_WORK}>
            {all.label}
            <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-1' />
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6'>{tileEls}</div>
      </div>
    </Section>
  );
}
