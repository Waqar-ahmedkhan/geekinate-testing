'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import BrandMark from '../BrandMark';
import GlassPill from './GlassPill';
import NavLinks from './NavLinks';
import ProgressRing from './ProgressRing';
import useScrollProgress from './useScrollProgress';
import { cn } from '@/lib/utils';
import { LAYOUT, NAV_LINKS, SITE } from '@/constants';

const PILL_HEIGHT = 40;
const PILL_COLLAPSED = 56;
const PILL_EXPANDED = 224;
const HERO_FRACTION = 0.5;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const COLLAPSE_MS = 600;
const WIDTH_TRANSITION = `width ${COLLAPSE_MS}ms ${EASE}, background-color ${COLLAPSE_MS}ms ${EASE}, color ${COLLAPSE_MS}ms ${EASE}`;
const WORDMARK_TRANSITION = `max-width ${COLLAPSE_MS}ms ${EASE}, padding-left ${COLLAPSE_MS}ms ${EASE}`;
const RETREAT_MS = 420;
const RETREAT_LEAD = 24;
const RETREAT_TRANSITION = `transform ${RETREAT_MS}ms ${EASE}`;
const SPREAD_MS = 720;
const SPREAD_TRANSITION = `max-width ${SPREAD_MS}ms ${EASE}`;
const CTA = { label: 'Start a project', href: '/#contact' };

const clamp = (value) => Math.min(1, Math.max(0, value));

const MenuPill = ({ className }) => (
  <GlassPill className={cn('h-[45px] gap-1.5 px-1.5 sm:gap-2', className)}>
    <NavLinks
      items={NAV_LINKS}
      className='min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    />
    <Link
      href={CTA.href}
      className='border-brutal shrink-0 rounded-full bg-volt px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap text-ink shadow-brutal-sm transition-colors duration-200 hover:bg-volt/85 sm:px-5 sm:text-sm'
    >
      {CTA.label}
    </Link>
  </GlassPill>
);

export default function Nav() {
  const pillRef = useRef(null);
  const railRef = useRef(null);
  const ringRef = useRef(null);
  const [threshold, setThreshold] = useState(0);
  const [paperBands, setPaperBands] = useState([]);
  const [pillLine, setPillLine] = useState(0);
  const [railWidth, setRailWidth] = useState(0);
  const [ringWidth, setRingWidth] = useState(PILL_EXPANDED);
  const [overFooter, setOverFooter] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [onPaper, setOnPaper] = useState(false);
  const sample = useCallback(
    (offset, smoothOffset, maxScroll) => {
      const past = threshold > 0 && offset >= threshold;
      const span = maxScroll - threshold;
      const pillAt = offset + pillLine;
      setCollapsed(past);
      setOnPaper(paperBands.some(([top, bottom]) => pillAt >= top && pillAt <= bottom));
      if (ringRef.current) ringRef.current(past && span > 0 ? clamp((smoothOffset - threshold) / span) : 0);
    },
    [threshold, pillLine, paperBands]
  );
  useScrollProgress(sample);
  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector('#hero');
      const heroHeight = hero ? hero.getBoundingClientRect().height : window.innerHeight;
      const pill = pillRef.current;
      const box = pill ? pill.getBoundingClientRect() : null;
      setThreshold(heroHeight * HERO_FRACTION);
      setPillLine(box ? box.top + box.height / 2 : 0);
      setPaperBands([...document.querySelectorAll('.on-paper')].map((node) => [node.offsetTop, node.offsetTop + node.offsetHeight]));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(() => setRailWidth(rail.getBoundingClientRect().width));
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    const observer = new ResizeObserver(() => setRingWidth(pill.getBoundingClientRect().width));
    observer.observe(pill);
    return () => observer.disconnect();
  }, []);
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
  const pillStyle = { width: `${collapsed ? PILL_COLLAPSED : PILL_EXPANDED}px`, height: `${PILL_HEIGHT}px`, transition: WIDTH_TRANSITION };
  const brandTone = collapsed ? 'border-0 bg-volt text-ink shadow-none backdrop-blur-none' : '';
  const wordmarkStyle = { maxWidth: collapsed ? 0 : '12rem', paddingLeft: collapsed ? 0 : '0.5rem', transition: WORDMARK_TRANSITION };
  const railStyle = { transform: overFooter ? 'translateY(-100%)' : 'translateY(0)', transition: RETREAT_TRANSITION };
  const contained = !collapsed;
  const spreadStyle = { maxWidth: `${contained ? LAYOUT.container : railWidth || LAYOUT.container}px`, transition: SPREAD_TRANSITION };
  const mobileRailStyle = {
    transform: overFooter ? 'translateY(calc(100% + 1rem))' : 'translateY(0)',
    transition: RETREAT_TRANSITION,
  };
  return (
    <>
      <nav ref={railRef} className='sticky top-0 z-50 px-4 pt-4 md:px-[30px] md:pt-[30px]' style={railStyle}>
        <div className='mx-auto' style={spreadStyle}>
          <div className='relative h-[46px]'>
            <div className='absolute left-1/2 top-0 -translate-x-1/2'>
              <GlassPill ref={pillRef} className={cn('justify-center px-3', brandTone)} style={pillStyle}>
                <Link
                  href='/'
                  aria-label={`${SITE.name} home`}
                  className='flex items-center font-logo text-base leading-none whitespace-nowrap'
                >
                  <BrandMark size={24} bare={collapsed} className='shrink-0' />
                  <span className='overflow-hidden' style={wordmarkStyle}>
                    {SITE.name}
                  </span>
                </Link>
                <ProgressRing ref={ringRef} width={ringWidth} height={PILL_HEIGHT} visible={collapsed} onPaper={onPaper} />
              </GlassPill>
            </div>
            <div className='absolute right-0 top-0 hidden lg:block'>
              <MenuPill />
            </div>
          </div>
        </div>
      </nav>
      <div className='fixed right-4 bottom-4 left-4 z-50 md:right-[30px] md:bottom-[30px] md:left-[30px] lg:hidden' style={mobileRailStyle}>
        <MenuPill className='w-full justify-between' />
      </div>
    </>
  );
}
