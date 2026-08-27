'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Section, SectionHead } from '@/components';
import { WorkTile } from '@/lib/ui/reusable_components';
import { work, workContent } from '@/lib/content';
import { WORK } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

export default function Work() {
  const { eyebrow, heading, allWork } = workContent;
  const runway = useRef(null);
  const panel = useRef(null);
  const content = useRef(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(`(min-width: ${WORK.pinMinWidth}px) and (prefers-reduced-motion: no-preference)`, () => {
      const travel = () => Math.max(0, content.current.offsetHeight - panel.current.clientHeight);
      const fit = () => {
        runway.current.style.height = `${Math.max(content.current.offsetHeight + WORK.framePad * 2, window.innerHeight)}px`;
        ScrollTrigger.refresh();
      };
      const watcher = new ResizeObserver(fit);
      watcher.observe(content.current);
      gsap.fromTo(
        content.current,
        { y: 0 },
        {
          y: () => -travel(),
          ease: 'none',
          scrollTrigger: { trigger: runway.current, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
        }
      );
      return () => {
        watcher.disconnect();
        if (runway.current) runway.current.style.height = '';
      };
    });
    return () => media.revert();
  }, []);
  const allWorkEl = allWork.href ? (
    <Link
      href={allWork.href}
      className='group flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mut transition-colors duration-200 hover:text-foreground'
    >
      {allWork.label}
      <ArrowRight className='size-3.5 transition-transform duration-200 group-hover:translate-x-1' />
    </Link>
  ) : null;
  return (
    <Section id='work' variant='clear' className='bg-paper px-4 py-0 md:px-7 md:py-0'>
      <div ref={runway} className='relative'>
        <div className='py-4 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:py-7'>
          <div ref={panel} className='h-full w-full overflow-hidden rounded-3xl bg-black'>
            <div ref={content} className='px-6 py-16 md:px-10 md:py-20'>
              <div className='mb-8 flex items-end justify-between gap-6 md:mb-10'>
                <SectionHead eyebrow={eyebrow} heading={heading} className='mb-0 md:mb-0' />
                {allWorkEl}
              </div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {work.map(({ slug, title, disciplines, span, href, media }) => (
                  <WorkTile key={slug} title={title} disciplines={disciplines} span={span} href={href} media={media} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
