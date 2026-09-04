'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollEngine } from '@/lib/scroll/controller';
import { watchScrollLock } from '@/lib/scroll/lock';
import { scrollProgress } from '@/lib/scroll/progress';
import { SNAKE } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    scrollProgress.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (scrollProgress.reduced) return undefined;
    const lenis = new Lenis({ lerp: SNAKE.scrollLerp, autoRaf: false, anchors: true });
    const track = ({ progress, scroll }) => {
      scrollProgress.raw = Number.isFinite(progress) ? progress : 0;
      scrollProgress.offset = Number.isFinite(scroll) ? scroll : 0;
    };
    const advance = (time) => lenis.raf(time * 1000);
    const hold = (held) => (held ? lenis.stop() : lenis.start());
    setScrollEngine(lenis);
    scrollProgress.driven = true;
    scrollProgress.offset = window.scrollY;
    lenis.on('scroll', track);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(advance);
    gsap.ticker.lagSmoothing(0);
    const release = watchScrollLock(hold);
    return () => {
      release();
      setScrollEngine(null);
      scrollProgress.driven = false;
      gsap.ticker.remove(advance);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off('scroll', track);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);
  return null;
}
