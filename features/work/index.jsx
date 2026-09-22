import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHead } from '@/components';
import { WorkTile } from '@/lib/ui/reusable_components';
import { work, workContent } from '@/lib/content';

const ALL_WORK =
  'group flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mut transition-colors duration-200 hover:text-foreground';

export default function Work() {
  const { eyebrow, heading, allWork } = workContent;
  const allWorkEl = allWork.href ? (
    <Link href={allWork.href} className={ALL_WORK}>
      {allWork.label}
      <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-1' />
    </Link>
  ) : null;
  const tileEls = work.map(({ slug, title, disciplines, span, href, media, hoverMedia }) => (
    <WorkTile key={slug} title={title} disciplines={disciplines} span={span} href={href} media={media} hoverMedia={hoverMedia} />
  ));
  return (
    <Section id='work' variant='paper'>
      <div className='mb-8 flex items-end justify-between gap-6 md:mb-10'>
        <SectionHead eyebrow={eyebrow} heading={heading} className='mb-0 md:mb-0' />
        {allWorkEl}
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6'>{tileEls}</div>
    </Section>
  );
}
