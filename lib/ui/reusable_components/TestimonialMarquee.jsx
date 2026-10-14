'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import TestimonialCard from './TestimonialCard';

const ANCHORS = ['end', 'start', 'end', 'center', 'end', 'center', 'start', 'end', 'start', 'center', 'start', 'end'];
const ANCHOR_CLASS = { start: 'items-start', center: 'items-center', end: 'items-end' };
const SPEED = 40;
const SLOW = 0.3;
const EASE = 3.5;
const SLOP = 4;

const wrap = (offset, half) => (half > 0 ? ((offset % half) + half) % half : 0);
const anchorOf = (index, count) => ANCHOR_CLASS[ANCHORS[(index % count) % ANCHORS.length]];
const byTouch = (event) => event.pointerType === 'touch';
const pulledTo = (drag, x) => drag.origin + (x - drag.pointer);
const heldOf = (target) => {
  const card = target.closest('[data-index] > *');
  return card ? Number(card.parentElement.dataset.index) : -1;
};

export default function TestimonialMarquee({ items }) {
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const badgeRef = useRef(null);
  const offsetRef = useRef(0);
  const lastRef = useRef(0);
  const speedRef = useRef(1);
  const targetRef = useRef(1);
  const dragRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [held, setHeld] = useState(-1);
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
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    let swipe = null;
    const release = () => {
      swipe = null;
      dragRef.current = null;
      setHeld(-1);
    };
    const begin = (event) => {
      release();
      if (event.touches.length > 1) return;
      const [touch] = event.touches;
      swipe = { y: touch.clientY, axis: '' };
      dragRef.current = { pointer: touch.clientX, origin: offsetRef.current };
      setHeld(heldOf(event.target));
    };
    const steer = (event) => {
      if (!swipe || !dragRef.current || event.touches.length > 1) return;
      const [touch] = event.touches;
      const across = Math.abs(touch.clientX - dragRef.current.pointer),
        down = Math.abs(touch.clientY - swipe.y);
      if (!swipe.axis && across + down < SLOP) return;
      swipe.axis ||= across > down ? 'x' : 'y';
      if (swipe.axis === 'y') {
        release();
        return;
      }
      if (event.cancelable) event.preventDefault();
      offsetRef.current = pulledTo(dragRef.current, touch.clientX);
    };
    frame.addEventListener('touchstart', begin, { passive: true });
    frame.addEventListener('touchmove', steer, { passive: false });
    frame.addEventListener('touchend', release);
    frame.addEventListener('touchcancel', release);
    return () => {
      frame.removeEventListener('touchstart', begin);
      frame.removeEventListener('touchmove', steer);
      frame.removeEventListener('touchend', release);
      frame.removeEventListener('touchcancel', release);
    };
  }, []);
  const startDrag = (event) => {
    if (byTouch(event)) return;
    dragRef.current = { pointer: event.clientX, origin: offsetRef.current };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeld(heldOf(event.target));
  };
  const moveDrag = (event) => {
    const badge = badgeRef.current;
    if (badge) {
      const bounds = event.currentTarget.getBoundingClientRect();
      badge.style.transform = `translate3d(${event.clientX - bounds.left}px, ${event.clientY - bounds.top}px, 0) translate(-50%, -50%)`;
    }
    if (byTouch(event) || !dragRef.current) return;
    offsetRef.current = pulledTo(dragRef.current, event.clientX);
  };
  const endDrag = (event) => {
    if (byTouch(event)) return;
    dragRef.current = null;
    setHeld(-1);
  };
  const enter = (event) => {
    if (event.pointerType !== 'mouse') return;
    targetRef.current = SLOW;
    setHovering(true);
  };
  const leave = (event) => {
    if (byTouch(event)) return;
    targetRef.current = 1;
    dragRef.current = null;
    setHovering(false);
  };
  return (
    <div
      ref={frameRef}
      className='relative cursor-none touch-pan-y touch-pinch-zoom overflow-hidden select-none'
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
            data-index={index}
            className={`flex h-[420px] w-[280px] shrink-0 sm:h-[520px] sm:w-[370px] ${anchorOf(index, items.length)}`}
            aria-hidden={index >= items.length}
          >
            <TestimonialCard quote={item.quote} name={item.name} role={item.role} held={index === held} />
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
