'use client';

import { useEffect, useRef, useState } from 'react';
import { cueSceneClock } from '@/lib/boot/clock';
import { isPhone } from '@/lib/boot/phone';
import { watchSettled } from '@/lib/boot/settled';
import { fitGlobe } from '@/lib/globe/fit';
import { measureLayout, measureStage, stage } from '@/lib/scroll/stage';
import { COSMOS, GLOBE, PHONE } from '@/constants';

const LAYER = 'absolute left-1/2 -translate-x-1/2 md:hidden';
const STILL = 'absolute inset-0 max-md:phone-globe';
const CLIP = 'absolute inset-0 size-full object-cover';
const { frame } = PHONE;
const radiusShare = fitGlobe(GLOBE.aspectRange[0]).radius / 2;
const FRAME_STYLE = {
  top: `calc(var(--globe-floor, ${PHONE.floorGuess}px) + ${GLOBE.floorGap}px - ${frame.rim * radiusShare * 100}%)`,
  height: `${frame.height * radiusShare * 100}%`,
  aspectRatio: `${frame.width} / ${frame.height}`,
};

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const framed = () => {
  const width = document.documentElement.clientWidth,
    height = window.innerHeight;
  const radius = radiusShare * height;
  const below = height - stage.floor - GLOBE.floorGap;
  return width / height <= GLOBE.aspectRange[0] && width / 2 <= (frame.width / 2) * radius && below <= (frame.height - frame.rim) * radius;
};

export default function PhoneGlobe({ live, onWake, onHandoff }) {
  const wrapRef = useRef(null);
  const clipRef = useRef(null);
  const doneRef = useRef(false);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    measureStage();
    if (!isPhone() || !framed()) {
      doneRef.current = true;
      if (isPhone()) onWake();
      onHandoff();
      return undefined;
    }
    if (reducedMotion()) return undefined;
    return watchSettled(() => setArmed(true));
  }, [onHandoff, onWake]);
  useEffect(() => {
    const clip = clipRef.current;
    const handOff = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onHandoff();
    };
    const tryHandoff = () => {
      if (!live || doneRef.current) return;
      if (stage.heroOut >= 1) {
        handOff();
        return;
      }
      if (stage.heroOut > PHONE.clip.handoffAtTop) return;
      cueSceneClock(clip && playing ? clip.currentTime : 0);
      requestAnimationFrame(() => requestAnimationFrame(handOff));
    };
    const follow = () => {
      measureStage();
      const wrap = wrapRef.current;
      if (wrap) {
        const view = window.innerHeight;
        const { radius } = fitGlobe(window.innerWidth / view);
        wrap.style.transform = `translateY(${(stage.heroOut * COSMOS.scrollSink * radius * view) / 2}px)`;
        wrap.style.opacity = String(1 - stage.heroOut);
      }
      tryHandoff();
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
  }, [live, playing, onHandoff]);
  useEffect(() => {
    const clip = clipRef.current;
    if (!armed || !clip) return undefined;
    const nearEnd = () => {
      if (clip.duration - clip.currentTime <= PHONE.clip.wakeLead) onWake();
    };
    const start = () => setPlaying(true);
    clip.addEventListener('playing', start);
    clip.addEventListener('timeupdate', nearEnd);
    clip.addEventListener('ended', onWake);
    clip.play().catch(onWake);
    return () => {
      clip.removeEventListener('playing', start);
      clip.removeEventListener('timeupdate', nearEnd);
      clip.removeEventListener('ended', onWake);
    };
  }, [armed, onWake]);
  const clipStyle = { opacity: playing ? 1 : 0 };
  const clipEl = armed ? (
    <video ref={clipRef} src={PHONE.clip.src} muted playsInline preload='auto' className={CLIP} style={clipStyle} />
  ) : null;
  return (
    <div ref={wrapRef} className='absolute inset-0'>
      <div className={LAYER} style={FRAME_STYLE}>
        <div className={STILL} />
        {clipEl}
      </div>
    </div>
  );
}
