'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { pageOffset } from '@/lib/scroll/progress';

const LERP = 0.12;
const SETTLED = 0.5;

export default function useScrollProgress(onSample) {
  const sample = useRef(onSample);
  useEffect(() => {
    sample.current = onSample;
  });
  useEffect(() => {
    const store = { target: 0, current: 0, maxScroll: 0 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      const target = pageOffset();
      if (target === store.target && store.current === store.target) return;
      store.target = target;
      const gap = store.target - store.current;
      store.current = reduced || Math.abs(gap) < SETTLED ? store.target : store.current + gap * LERP;
      sample.current(store.target, store.current, store.maxScroll);
    };
    const remeasure = () => {
      store.maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      store.current = pageOffset();
      store.target = store.current;
      sample.current(store.target, store.current, store.maxScroll);
    };
    const watcher = new ResizeObserver(remeasure);
    watcher.observe(document.body);
    remeasure();
    window.addEventListener('resize', remeasure);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      watcher.disconnect();
      window.removeEventListener('resize', remeasure);
    };
  }, []);
}
