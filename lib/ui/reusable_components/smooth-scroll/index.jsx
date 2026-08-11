'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollProgress } from '@/lib/scroll/progress';
import { SNAKE } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

// Lenis at the app shell, rendering nothing. It only has to exist and run — wrapping children would push the whole tree over a
// client boundary for a component that paints no markup.
//
// `anchors` hands nav links back to Lenis. Native anchor jumps used to be smoothed by `html { scroll-behavior: smooth }`, which had
// to come out of globals.css: Lenis drives the scroll position itself and the CSS smoothing fights it.
//
// Since 2026-08-11 this also bridges Lenis to ScrollTrigger, and the bridge is the reason `autoRaf` is off. Two independent rAF
// loops let GSAP read a scroll position Lenis has already moved past, which shows up as scrubbed animations trailing the scroll by a
// frame. Driving Lenis from gsap.ticker puts both on one clock. `lagSmoothing(0)` is required with it: GSAP's default is to clamp a
// long frame, and a clamped delta handed to Lenis makes the page jump after any stall.
//
// This component must stay ahead of anything that reads `scrollProgress.reduced` — it is the only writer, and sibling effects run in
// document order. `CosmosCanvas` reads it, so it renders after this.
export default function SmoothScroll() {
  useEffect(() => {
    scrollProgress.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion keeps the scene parked on the star. The journey is the whole effect and there is no meaningful quieter version
    // of it, so the honest reduction is no motion at all rather than a slower one.
    if (scrollProgress.reduced) return undefined;
    const lenis = new Lenis({ lerp: SNAKE.scrollLerp, autoRaf: false, anchors: true });
    const track = ({ progress }) => {
      scrollProgress.raw = Number.isFinite(progress) ? progress : 0;
    };
    const advance = (time) => lenis.raf(time * 1000);
    lenis.on('scroll', track);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(advance);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(advance);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off('scroll', track);
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);
  return null;
}
