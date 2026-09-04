'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { MARQUEE } from '@/constants';

const wrap = (offset, span) => (span > 0 ? ((offset % span) + span) % span : 0);

export default function Marquee({ children, speed = MARQUEE.speed, gap = MARQUEE.gap, fade = MARQUEE.fadeWidth }) {
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const groupRef = useRef(null);
  const spanRef = useRef(0);
  const paceRef = useRef(1);
  const restRef = useRef(1);
  const [copies, setCopies] = useState(MARQUEE.minCopies);

  useEffect(() => {
    const frame = frameRef.current,
      group = groupRef.current;
    if (!frame || !group) return undefined;
    const measure = () => {
      const span = group.getBoundingClientRect().width + gap;
      spanRef.current = span;
      setCopies(Math.max(MARQUEE.minCopies, Math.ceil(frame.getBoundingClientRect().width / span) + 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(group);
    return () => observer.disconnect();
  }, [gap]);

  useEffect(() => {
    const frame = frameRef.current,
      track = trackRef.current;
    if (!frame || !track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let running = false,
      last = 0,
      offset = 0;
    const step = (time) => {
      const now = time * 1000;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      paceRef.current += (restRef.current - paceRef.current) * MARQUEE.hoverEase;
      offset = -wrap(speed * paceRef.current * delta - offset, spanRef.current);
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === running) return;
      running = entry.isIntersecting;
      last = 0;
      if (running) gsap.ticker.add(step);
      else gsap.ticker.remove(step);
    });
    const slow = () => {
      restRef.current = MARQUEE.hoverFactor;
    };
    const resume = () => {
      restRef.current = 1;
    };
    frame.addEventListener('pointerenter', slow);
    frame.addEventListener('pointerleave', resume);
    watcher.observe(frame);
    return () => {
      watcher.disconnect();
      frame.removeEventListener('pointerenter', slow);
      frame.removeEventListener('pointerleave', resume);
      gsap.ticker.remove(step);
      running = false;
    };
  }, [speed]);

  const edge = `linear-gradient(to right, transparent 0%, #000 ${fade / 2}%, #000 ${100 - fade / 2}%, transparent 100%)`;
  const frameStyle = { maskImage: edge, WebkitMaskImage: edge, padding: MARQUEE.padding };
  const trackStyle = { gap: `${gap}px` };
  const groups = Array.from({ length: copies }, (unused, index) => (
    <div key={index} ref={index === 0 ? groupRef : null} aria-hidden={index > 0} className='flex shrink-0 items-center' style={trackStyle}>
      {children}
    </div>
  ));
  return (
    <div ref={frameRef} className='relative overflow-hidden' style={frameStyle}>
      <div ref={trackRef} className='flex w-max items-center will-change-transform' style={trackStyle}>
        {groups}
      </div>
    </div>
  );
}
