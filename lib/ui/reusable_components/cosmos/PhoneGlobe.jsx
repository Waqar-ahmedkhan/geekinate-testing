'use client';

import { useEffect, useRef } from 'react';
import { isPhone } from '@/lib/boot/phone';
import { fitGlobe } from '@/lib/globe/fit';
import { measureLayout, measureStage, stage } from '@/lib/scroll/stage';
import { COSMOS, GLOBE, PHONE } from '@/constants';

const LAYER = 'absolute left-1/2 -translate-x-1/2 md:hidden';
const STILL = 'absolute inset-0 size-full object-cover [mask-image:linear-gradient(to_bottom,transparent,#000_9%)]';
const BLANK = 'data:,';
const { frame } = PHONE;
const radiusShare = fitGlobe(GLOBE.aspectRange[0]).radius / 2;
const FRAME_STYLE = {
  top: `calc(var(--globe-floor, ${PHONE.floorGuess}px) + ${GLOBE.floorGap}px - ${frame.rim * radiusShare * 100}%)`,
  height: `${frame.height * radiusShare * 100}%`,
  aspectRatio: `${frame.width} / ${frame.height}`,
};

const framed = () => {
  const width = document.documentElement.clientWidth,
    height = window.innerHeight;
  const radius = radiusShare * height;
  const below = height - stage.floor - GLOBE.floorGap;
  return width / height <= GLOBE.aspectRange[0] && width / 2 <= (frame.width / 2) * radius && below <= (frame.height - frame.rim) * radius;
};

export default function PhoneGlobe({ live, onHandoff }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    measureStage();
    if (live || !isPhone() || !framed()) onHandoff();
  }, [live, onHandoff]);
  useEffect(() => {
    const follow = () => {
      measureStage();
      const wrap = wrapRef.current;
      if (!wrap) return;
      const view = window.innerHeight;
      const { radius } = fitGlobe(window.innerWidth / view);
      wrap.style.transform = `translateY(${(stage.heroOut * COSMOS.scrollSink * radius * view) / 2}px)`;
      wrap.style.opacity = String(1 - stage.heroOut);
    };
    const refit = () => {
      measureLayout();
      wrapRef.current?.style.setProperty('--globe-floor', `${stage.floor}px`);
      follow();
    };
    refit();
    window.addEventListener('scroll', follow, { passive: true });
    window.addEventListener('resize', refit);
    return () => {
      window.removeEventListener('scroll', follow);
      window.removeEventListener('resize', refit);
    };
  }, []);
  return (
    <div ref={wrapRef} className='absolute inset-0'>
      <div className={LAYER} style={FRAME_STYLE}>
        <picture>
          <source media={PHONE.wide} srcSet={BLANK} />
          <source type='image/avif' srcSet={PHONE.still.avif} />
          <img src={PHONE.still.webp} alt='' fetchPriority='high' className={STILL} />
        </picture>
      </div>
    </div>
  );
}
