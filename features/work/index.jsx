import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHead } from '@/components';
import { WorkTile } from '@/lib/ui/reusable_components';
import { work, workContent } from '@/lib/content';

export default function Work() {
  const { eyebrow, heading, allWork } = workContent;
  const allWorkEl = allWork.href ? (
    <Link
      href={allWork.href}
      className='group flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mut transition-colors duration-200 hover:text-ink'
    >
      {allWork.label}
      <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-1' />
    </Link>
  ) : null;
  return (
    <Section id='work' variant='light'>
      <div className='mb-8 flex items-end justify-between gap-6 md:mb-10'>
        {/* Both breakpoints, or SectionHead's own md:mb-10 survives twMerge and stacks on the wrapper's margin. */}
        <SectionHead eyebrow={eyebrow} heading={heading} className='mb-0 md:mb-0' />
        {allWorkEl}
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {work.map(({ slug, title, disciplines, span, href, media }) => (
          <WorkTile key={slug} title={title} disciplines={disciplines} span={span} href={href} media={media} />
        ))}
      </div>
    </Section>
  );
}
