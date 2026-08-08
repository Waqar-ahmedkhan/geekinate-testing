'use client';

import { useEffect, useRef, useState } from 'react';
import TestimonialCard from './TestimonialCard';

// The drifting, draggable row from wearestokt.com, measured live: 370px cards, 30px gaps, and each card anchored to the top,
// middle or bottom of a fixed 520px slot. That anchor sequence is what produces the stagger — without it the row is a flat strip.
// It is authored per card on the reference, so it is transcribed rather than generated.
const ANCHORS = ['end', 'start', 'end', 'center', 'end', 'center', 'start', 'end', 'start', 'center', 'start', 'end'];
const ANCHOR_CLASS = { start: 'items-start', center: 'items-center', end: 'items-end' };
const SPEED = 40;
const GAP = 30;

// The list is rendered twice and the offset wraps at half the track width, which is what makes the loop seamless. Any wrap point
// short of that reveals the seam as a gap on the right edge.
const wrap = (offset, half) => (half > 0 ? ((offset % half) + half) % half : 0);

export default function TestimonialMarquee({ items }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const pausedRef = useRef(false);
  const dragRef = useRef(null);
  const [badge, setBadge] = useState(null);
  const loop = [...items, ...items];
  // Reduced motion gets a plain scrollable row: the drift is the whole effect, and there is no meaningful reduced version of it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const step = (now) => {
      const half = track.scrollWidth / 2;
      const elapsed = lastRef.current ? Math.min((now - lastRef.current) / 1000, 0.1) : 0;
      lastRef.current = now;
      if (!pausedRef.current && !dragRef.current) offsetRef.current -= SPEED * elapsed;
      offsetRef.current = -wrap(-offsetRef.current, half);
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    // The id has to go back to 0. StrictMode remounts in dev, and a stale non-zero id makes the second mount skip scheduling.
    return () => {
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
  const enter = () => (pausedRef.current = true);
  const leave = () => {
    pausedRef.current = false;
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
      <div ref={trackRef} className='flex w-max' style={{ gap: `${GAP}px` }}>
        {loop.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={`flex h-[520px] w-[370px] shrink-0 ${ANCHOR_CLASS[ANCHORS[index % ANCHORS.length]]}`}
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
