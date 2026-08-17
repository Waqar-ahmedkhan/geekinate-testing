'use client';

import { useEffect, useRef, useState } from 'react';
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
// The rail is a centred container while the hero is behind it and full width once the next section arrives. Both ends are px, which
// is what makes it animate — max-width has no interpolation to or from `none`, so the open state is the measured rail width rather
// than an absent limit. Below the container width the two states are identical and nothing appears to happen, which is correct.
const SPREAD_MS = 720;
const SPREAD_TRANSITION = `max-width ${SPREAD_MS}ms ${EASE}`;
const CTA = { label: 'Start a project', href: '#contact' };

const clamp = (value) => Math.min(1, Math.max(0, value));

// The links give way before the call to action does.
//
// This pill carries four links and a CTA, and below about 480px of viewport their natural widths add up to more than the bar has —
// on a 390px phone by 105px, on a 320px one by 175px. Left to overflow, the thing that hung off the right-hand edge was the CTA: on
// every phone in portrait the site's primary conversion control was partly or mostly off screen and could not be tapped.
//
// So the row is told explicitly which half is allowed to lose. `min-w-0` lets the list shrink below its content — a flex item will
// not otherwise go under its own min-content width, which is what forced the overflow onto its sibling — and `shrink-0` pins the
// CTA at full width whatever is left. The links then scroll horizontally in the space that remains rather than pushing anything out
// of the bar. Their own padding and type come down a step at phone sizes first, so on the common widths there is nothing to scroll.
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
  const { offset, smoothOffset, maxScroll } = useScrollProgress();
  const pillRef = useRef(null);
  const railRef = useRef(null);
  const [threshold, setThreshold] = useState(0);
  // Every paper section as a [top, bottom] pair in document coordinates, plus where the pill sits down the viewport. The rail is
  // sticky at the top and never moves, so that second number is a constant and the two together answer "is the pill over white"
  // from the scroll offset alone — no rect read per frame.
  const [paperBands, setPaperBands] = useState([]);
  const [pillLine, setPillLine] = useState(0);
  const [railWidth, setRailWidth] = useState(0);
  const [ringWidth, setRingWidth] = useState(PILL_EXPANDED);
  const [overFooter, setOverFooter] = useState(false);
  // Collapse and progress both begin half way down the hero. Keyed to the real section once one exists, viewport height until then.
  useEffect(() => {
    const measure = () => {
      const hero = document.querySelector('#hero');
      const heroHeight = hero ? hero.getBoundingClientRect().height : window.innerHeight;
      const pill = pillRef.current;
      const box = pill ? pill.getBoundingClientRect() : null;
      setThreshold(heroHeight * HERO_FRACTION);
      setPillLine(box ? box.top + box.height / 2 : 0);
      // `.on-paper` is every white section. The ring reads this to pick a stroke that shows against the surface directly under it,
      // and the pill itself is one glass surface on every ground — see GlassPill.
      setPaperBands([...document.querySelectorAll('.on-paper')].map((node) => [node.offsetTop, node.offsetTop + node.offsetHeight]));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // The open state's width. Taken from the rail itself, which is full-bleed and never constrained by the container inside it, so
  // there is no feedback loop between what is measured and what the measurement sets.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(() => setRailWidth(rail.getBoundingClientRect().width));
    observer.observe(rail);
    return () => observer.disconnect();
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
  // Volt only once the pill has closed to its circle. Expanded it is a glass bar with the wordmark on it and the mark keeps its own
  // tile, which is the arrangement the hero already had and which nothing was wrong with. border-0 matters only in the collapsed
  // state, and only because the ring is visible there — see the note where ProgressRing is rendered.
  const brandTone = collapsed ? 'border-0 bg-volt text-ink shadow-none backdrop-blur-none' : '';
  const wordmarkStyle = { maxWidth: collapsed ? 0 : '12rem', paddingLeft: collapsed ? 0 : '0.5rem', transition: WORDMARK_TRANSITION };
  // Each rail leaves by its nearest edge. The bottom pill clears its own 16px offset as well, or a sliver stays on screen.
  const railStyle = { transform: overFooter ? 'translateY(-100%)' : 'translateY(0)', transition: RETREAT_TRANSITION };
  // The rail opens out on the same beat the brand pill collapses to its circle, not on a collision line of its own. Two chrome
  // transitions a viewport apart read as the navbar twitching twice; on one beat it reads as a single gear change.
  const contained = !collapsed;
  // Which ground the pill is currently sitting on. The ring flips with it — see ProgressRing.
  const pillAt = offset + pillLine;
  const onPaper = paperBands.some(([top, bottom]) => pillAt >= top && pillAt <= bottom);
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
                {/* The ring is absolutely positioned inside the pill, so its origin is the pill's *padding* box while its width and
                    height are measured off the border box. A 1px border therefore pushes it a pixel in at the top left and a pixel
                    out at the bottom right, which shows as a stub of stroke poking past the fill at exactly those two corners — which
                    is why the collapsed state drops the border rather than making it transparent. */}
                <ProgressRing width={ringWidth} height={PILL_HEIGHT} progress={progress} visible={collapsed} onPaper={onPaper} />
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
