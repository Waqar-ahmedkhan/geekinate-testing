'use client';

import { useEffect, useRef, useState } from 'react';
import TestimonialCard from './TestimonialCard';

const ANCHORS = ['end', 'start', 'end', 'center', 'end', 'center', 'start', 'end', 'start', 'center', 'start', 'end'];
const ANCHOR_CLASS = { start: 'items-start', center: 'items-center', end: 'items-end' };
const SPEED = 40;
const SLOW = 0.3;
const EASE = 3.5;

const wrap = (offset, half) => (half > 0 ? ((offset % half) + half) % half : 0);

export default function TestimonialMarquee({ items }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const speedRef = useRef(1);
  const targetRef = useRef(1);
  const dragRef = useRef(null);
  const [badge, setBadge] = useState(null);
  const loop = [...items, ...items];
  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let half = track.scrollWidth / 2,
      visible = false;
    const step = (now) => {
      if (!visible) {
        frameRef.current = 0;
        return;
      }
      frameRef.current = requestAnimationFrame(step);
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
      visible = entry.isIntersecting;
      if (visible && !frameRef.current) {
        lastRef.current = 0;
        frameRef.current = requestAnimationFrame(step);
      }
    });
    sizer.observe(track);
    watcher.observe(track);
    return () => {
      sizer.disconnect();
      watcher.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      lastRef.current = 0;
    };
  }, []);
  const startDrag = (event) => {
    dragRef.current = { pointer: event.clientX, origin: offsetRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setBadge({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    if (!dragRef.current) return;
    offsetRef.current = dragRef.current.origin + (event.clientX - dragRef.current.pointer);
  };
  const endDrag = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const enter = () => (targetRef.current = SLOW);
  const leave = () => {
    targetRef.current = 1;
    dragRef.current = null;
    setBadge(null);
  };
  const badgeStyle = badge ? { left: `${badge.x}px`, top: `${badge.y}px` } : null;
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
      {badgeStyle ? (
        <span
          aria-hidden='true'
          className='pointer-events-none absolute z-10 flex size-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper font-mono text-[10px] uppercase tracking-[0.1em] text-ink'
          style={badgeStyle}
        >
          &#8592; Drag &#8594;
        </span>
      ) : null}
    </div>
  );
}
