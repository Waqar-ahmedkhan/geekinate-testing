'use client';

import { useEffect, useRef, useState } from 'react';

const LERP = 0.12;
const SETTLED = 0.5;

// Reports the raw scroll offset for instant triggers and a lerped copy for anything that should trail the scroll. The trailing copy
// is what gives scroll-linked motion its smooth-scroll feel without pulling a smooth-scroll library into the whole site.
export default function useScrollProgress() {
  const [scroll, setScroll] = useState({ offset: 0, smoothOffset: 0, maxScroll: 0 });
  const state = useRef({ target: 0, current: 0, frame: 0, reduced: false });
  useEffect(() => {
    const store = state.current;
    store.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const gap = store.target - store.current;
      store.current = store.reduced || Math.abs(gap) < SETTLED ? store.target : store.current + gap * LERP;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScroll({ offset: window.scrollY, smoothOffset: store.current, maxScroll });
      store.frame = store.current === store.target ? 0 : requestAnimationFrame(tick);
    };
    const measure = () => {
      store.target = window.scrollY;
      if (!store.frame) store.frame = requestAnimationFrame(tick);
    };
    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(store.frame);
      // The ref survives StrictMode's remount, so a stale id here would stop measure() ever scheduling again.
      store.frame = 0;
    };
  }, []);
  return scroll;
}
