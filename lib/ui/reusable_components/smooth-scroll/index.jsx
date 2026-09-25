'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { watchSettled } from '@/lib/boot/settled';
import { setScrollEngine, settleScrollEngine } from '@/lib/scroll/controller';
import { watchScrollLock } from '@/lib/scroll/lock';
import { scrollProgress } from '@/lib/scroll/progress';
import { SNAKE } from '@/constants';

const loadEngine = () => Promise.all([import('lenis'), import('gsap/ScrollTrigger')]);

export default function SmoothScroll() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    settleScrollEngine();
  }, [pathname]);
  useEffect(() => {
    scrollProgress.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (scrollProgress.reduced) return undefined;
    let live = true,
      teardown = () => {};
    const start = async () => {
      const [{ default: Lenis }, { ScrollTrigger }] = await loadEngine();
      if (!live) return;
      gsap.registerPlugin(ScrollTrigger);
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
      teardown = () => {
        release();
        setScrollEngine(null);
        scrollProgress.driven = false;
        gsap.ticker.remove(advance);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.off('scroll', track);
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      };
    };
    const unwatch = watchSettled(start);
    return () => {
      live = false;
      unwatch();
      teardown();
    };
  }, []);
  return null;
}
