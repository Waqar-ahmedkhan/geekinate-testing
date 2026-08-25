'use client';

import { useEffect, useRef } from 'react';

const LERP = 0.12;
const SETTLED = 0.5;

export default function useScrollProgress(onSample) {
  const sample = useRef(onSample);
  useEffect(() => {
    sample.current = onSample;
  });
  useEffect(() => {
    const store = { target: 0, current: 0, frame: 0, maxScroll: 0 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const gap = store.target - store.current;
      store.current = reduced || Math.abs(gap) < SETTLED ? store.target : store.current + gap * LERP;
      sample.current(store.target, store.current, store.maxScroll);
      store.frame = store.current === store.target ? 0 : requestAnimationFrame(tick);
    };
    const measure = () => {
      store.target = window.scrollY;
      if (!store.frame) store.frame = requestAnimationFrame(tick);
    };
    const remeasure = () => {
      store.maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      measure();
    };
    const watcher = new ResizeObserver(remeasure);
    watcher.observe(document.body);
    remeasure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      watcher.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', remeasure);
      cancelAnimationFrame(store.frame);
      store.frame = 0;
    };
  }, []);
}
