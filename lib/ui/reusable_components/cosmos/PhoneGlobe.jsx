'use client';

import { useEffect, useRef, useState } from 'react';
import { cueSceneClock } from '@/lib/boot/clock';
import { isPhone } from '@/lib/boot/phone';
import { watchSettled } from '@/lib/boot/settled';
import { fitGlobe } from '@/lib/globe/fit';
import { measureStage, stage } from '@/lib/scroll/stage';
import { COSMOS, PHONE } from '@/constants';

const LAYER = 'absolute bottom-0 left-1/2 h-[53.83%] aspect-[824/886] -translate-x-1/2 md:hidden';
const STILL = `${LAYER} max-md:phone-globe`;
const CLIP = `${LAYER} object-cover`;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PhoneGlobe({ live, onWake, onHandoff }) {
  const wrapRef = useRef(null);
  const clipRef = useRef(null);
  const doneRef = useRef(false);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!isPhone()) {
      doneRef.current = true;
      onHandoff();
      return undefined;
    }
    if (reducedMotion()) return undefined;
    return watchSettled(() => setArmed(true));
  }, [onHandoff]);
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
    follow();
    window.addEventListener('scroll', follow, { passive: true });
    return () => window.removeEventListener('scroll', follow);
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
      <div className={STILL} />
      {clipEl}
    </div>
  );
}
