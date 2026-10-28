'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SHEET } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

const STAGE = 'relative z-10 lg:sticky lg:top-[min(0px,calc(100svh_-_var(--hero-h,100svh)))]';
const SHADE = 'pointer-events-none absolute inset-0 bg-black opacity-0';
const EDGE =
  '-mt-[100svh] [&>:first-child]:rounded-t-3xl sheet-screen:flex sheet-screen:min-h-svh sheet-screen:flex-col sheet-screen:justify-center';

export default function HeroSheet({ hero, children }) {
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const shadeRef = useRef(null);
  const sheetRef = useRef(null);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    const fit = () => {
      stage.style.setProperty('--hero-h', `${stage.offsetHeight}px`);
      ScrollTrigger.refresh();
    };
    const sizer = new ResizeObserver(fit);
    const media = gsap.matchMedia();
    media.add(`${SHEET.holdFrom} and (prefers-reduced-motion: no-preference)`, () => {
      gsap
        .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sheet, start: 'top bottom', end: 'top top', scrub: true } })
        .to(heroRef.current, { scale: SHEET.recede.scale }, 0)
        .to(shadeRef.current, { opacity: SHEET.recede.dim }, 0);
    });
    sizer.observe(stage);
    return () => {
      sizer.disconnect();
      media.revert();
    };
  }, []);
  return (
    <>
      <div>
        <div ref={stageRef} className={STAGE}>
          <div ref={heroRef} className='origin-top'>
            {hero}
          </div>
          <div ref={shadeRef} aria-hidden='true' className={SHADE} />
        </div>
        <div aria-hidden='true' className='h-svh' />
      </div>
      <div ref={sheetRef} className={EDGE}>
        {children}
      </div>
    </>
  );
}
