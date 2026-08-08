'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import BrandMark from '../BrandMark';
import GlassPill from './GlassPill';
import NavLinks from './NavLinks';
import ProgressRing from './ProgressRing';
import useScrollProgress from './useScrollProgress';
import { cn } from '@/lib/utils';
import { NAV_LINKS, SITE } from '@/constants';

const PILL_HEIGHT = 40;
const PILL_COLLAPSED = 56;
const PILL_EXPANDED = 224;
const HERO_FRACTION = 0.5;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const COLLAPSE_MS = 600;
const WIDTH_TRANSITION = `width ${COLLAPSE_MS}ms ${EASE}`;
const WORDMARK_TRANSITION = `max-width ${COLLAPSE_MS}ms ${EASE}, padding-left ${COLLAPSE_MS}ms ${EASE}`;
const RETREAT_MS = 420;
const RETREAT_LEAD = 24;
const RETREAT_TRANSITION = `transform ${RETREAT_MS}ms ${EASE}`;
const CTA = { label: 'Start a project', href: '#contact' };

const clamp = (value) => Math.min(1, Math.max(0, value));

const MenuPill = ({ className }) => (
  <GlassPill className={cn('h-[45px] gap-2 px-1.5', className)}>
    <NavLinks items={NAV_LINKS} />
    <Link
      href={CTA.href}
      className='border-brutal rounded-full bg-volt px-5 py-1.5 text-sm font-semibold whitespace-nowrap text-ink shadow-brutal-sm transition-colors duration-200 hover:bg-volt/85'
    >
      {CTA.label}
    </Link>
  </GlassPill>
);

export default function Nav() {
  const { offset, smoothOffset, maxScroll } = useScrollProgress();
  const pillRef = useRef(null);
  const railRef = useRef(null);
  const [threshold, setThreshold] = useState(0);
  const [ringWidth, setRingWidth] = useState(PILL_EXPANDED);
  const [overFooter, setOverFooter] = useState(false);
  // Collapse and progress both begin half way down the hero. Keyed to the real section once one exists, viewport height until then.
  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector('#hero');
      const heroHeight = hero ? hero.getBoundingClientRect().height : window.innerHeight;
      setThreshold(heroHeight * HERO_FRACTION);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // The pill's width is mid-transition for 600ms, so the ring geometry follows the painted box rather than the target value.
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const observer = new ResizeObserver(() => setRingWidth(pill.getBoundingClientRect().width));
    observer.observe(pill);
    return () => observer.disconnect();
  }, []);
  // The footer is a full-viewport panel and the rail is sticky, so the pills would land on its column headings. The rail retreats
  // by its own height on the way in and eases back on the way out.
  //
  // The trigger is the **collision line, not the footer entering the viewport**. A bare observer fires the moment one pixel of the
  // footer clears the bottom edge, which is a whole viewport of scrolling too early — the nav vanishes over the section above and
  // the page looks broken. A negative bottom rootMargin shrinks the observation box down to the rail's own strip, so intersection
  // means the footer has actually reached the rail. It depends on viewport height, so it is rebuilt on resize.
  useEffect(() => {
    const footer = document.querySelector('footer');
    const rail = railRef.current;
    if (!footer || !rail) return;
    let observer = null;
    const watch = () => {
      observer?.disconnect();
      const trigger = rail.getBoundingClientRect().height + RETREAT_LEAD;
      const shrink = Math.max(0, window.innerHeight - trigger);
      observer = new IntersectionObserver(([entry]) => setOverFooter(entry.isIntersecting), {
        rootMargin: `0px 0px -${shrink}px 0px`,
      });
      observer.observe(footer);
    };
    watch();
    window.addEventListener('resize', watch);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', watch);
    };
  }, []);
  // Raw offset drives the switch so bar becomes pill exactly at the threshold; the trailing offset drives the ring so it eases.
  const collapsed = threshold > 0 && offset >= threshold;
  const span = maxScroll - threshold;
  const progress = collapsed && span > 0 ? clamp((smoothOffset - threshold) / span) : 0;
  const pillStyle = { width: `${collapsed ? PILL_COLLAPSED : PILL_EXPANDED}px`, height: `${PILL_HEIGHT}px`, transition: WIDTH_TRANSITION };
  // padding-left collapses with the wordmark: a border-box element cannot shrink below its own padding, so max-width alone would
  // leave 8px of dead space and push the mark off centre.
  const wordmarkStyle = { maxWidth: collapsed ? 0 : '12rem', paddingLeft: collapsed ? 0 : '0.5rem', transition: WORDMARK_TRANSITION };
  // Each rail leaves by its nearest edge. The bottom pill clears its own 16px offset as well, or a sliver stays on screen.
  const railStyle = { transform: overFooter ? 'translateY(-100%)' : 'translateY(0)', transition: RETREAT_TRANSITION };
  const mobileRailStyle = {
    transform: overFooter ? 'translateY(calc(100% + 1rem))' : 'translateY(0)',
    transition: RETREAT_TRANSITION,
  };
  return (
    <>
      <nav ref={railRef} className='sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px]' style={railStyle}>
        <div className='relative h-[46px]'>
          <div className='absolute left-1/2 top-0 -translate-x-1/2'>
            <GlassPill ref={pillRef} className='justify-center px-3' style={pillStyle}>
              <Link
                href='/'
                aria-label={`${SITE.name} home`}
                className='flex items-center font-logo text-base leading-none whitespace-nowrap'
              >
                <BrandMark size={24} className='shrink-0' />
                <span className='overflow-hidden' style={wordmarkStyle}>
                  {SITE.name}
                </span>
              </Link>
              <ProgressRing width={ringWidth} height={PILL_HEIGHT} progress={progress} visible={collapsed} />
            </GlassPill>
          </div>
          <div className='absolute right-0 top-0 hidden lg:block'>
            <MenuPill />
          </div>
        </div>
      </nav>
      <div className='fixed right-4 bottom-4 left-4 z-50 md:right-[30px] md:bottom-[30px] md:left-[30px] lg:hidden' style={mobileRailStyle}>
        <MenuPill className='w-full justify-between' />
      </div>
    </>
  );
}
