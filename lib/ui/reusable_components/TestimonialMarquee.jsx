'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import TestimonialCard from './TestimonialCard';

const ANCHORS = ['end', 'start', 'end', 'center', 'end', 'center', 'start', 'end', 'start', 'center', 'start', 'end'];
const ANCHOR_CLASS = { start: 'items-start', center: 'items-center', end: 'items-end' };
const SPEED = 40;
const SLOW = 0.3;
const EASE = 3.5;

const wrap = (offset, half) => (half > 0 ? ((offset % half) + half) % half : 0);

export default function TestimonialMarquee({ items }) {
  const trackRef = useRef(null);
  const badgeRef = useRef(null);
  const offsetRef = useRef(0);
  const lastRef = useRef(0);
  const speedRef = useRef(1);
  const targetRef = useRef(1);
  const dragRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const loop = [...items, ...items];
  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let half = track.scrollWidth / 2,
      running = false;
    const step = (time) => {
      const now = time * 1000;
      const elapsed = lastRef.current ? Math.min((now - lastRef.current) / 1000, 0.1) : 0;
      lastRef.current = now;
      speedRef.current += (targetRef.current - speedRef.current) * Math.min(1, elapsed * EASE);
      if (!dragRef.current) offsetRef.current -= SPEED * speedRef.current * elapsed;
      offsetRef.current = -wrap(-offsetRef.current, half);
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    };
    const sizer = new ResizeObserver(() => {
      half = track.scrollWidth / 2;
    });
    const watcher = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === running) return;
      running = entry.isIntersecting;
      lastRef.current = 0;
      if (running) gsap.ticker.add(step);
      else gsap.ticker.remove(step);
    });
    sizer.observe(track);
    watcher.observe(track);
    return () => {
      sizer.disconnect();
      watcher.disconnect();
      gsap.ticker.remove(step);
      running = false;
      lastRef.current = 0;
    };
  }, []);
  const startDrag = (event) => {
    dragRef.current = { pointer: event.clientX, origin: offsetRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    const badge = badgeRef.current;
    if (badge) {
      const bounds = event.currentTarget.getBoundingClientRect();
      badge.style.transform = `translate3d(${event.clientX - bounds.left}px, ${event.clientY - bounds.top}px, 0) translate(-50%, -50%)`;
    }
    if (!dragRef.current) return;
    offsetRef.current = dragRef.current.origin + (event.clientX - dragRef.current.pointer);
  };
  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const enter = () => {
    targetRef.current = SLOW;
    setHovering(true);
  };
  const leave = () => {
    targetRef.current = 1;
    dragRef.current = null;
    setHovering(false);
  };
  return (
    <div
      className='relative cursor-none overflow-hidden select-none'
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div ref={trackRef} className='flex w-max gap-4 sm:gap-[30px]'>
        {loop.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={`flex h-[420px] w-[280px] shrink-0 sm:h-[520px] sm:w-[370px] ${ANCHOR_CLASS[ANCHORS[index % ANCHORS.length]]}`}
            aria-hidden={index >= items.length}
          >
            <TestimonialCard quote={item.quote} name={item.name} role={item.role} />
          </div>
        ))}
      </div>
      {hovering ? (
        <span
          ref={badgeRef}
          aria-hidden='true'
          className='pointer-events-none absolute left-0 top-0 z-10 flex size-[76px] items-center justify-center rounded-full bg-paper font-mono text-[10px] uppercase tracking-[0.1em] text-ink'
        >
          &#8592; Drag &#8594;
        </span>
      ) : null}
    </div>
  );
}
