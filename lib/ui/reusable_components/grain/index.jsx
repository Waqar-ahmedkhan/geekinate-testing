'use client';

import { useEffect, useRef } from 'react';
import { createGrain, grainFade, shedGrain, shedRing, stepGrain } from './pool';
import { bakeGrain } from './sprite';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { GRAIN } from '@/constants';

const LIGHT_GROUND = 140;

const groundIsLight = (element) => {
  for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
    const parts = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
    if (!parts) continue;
    const [red, green, blue, alpha = 1] = parts.map(Number);
    if (alpha < 0.5) continue;
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue > LIGHT_GROUND;
  }
  return false;
};

export default function GrainWake() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || scrollProgress.reduced) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    const pool = createGrain(GRAIN.count);
    let sprites = [],
      width = 0,
      height = 0;
    let frame = 0,
      stamp = 0,
      lastX = 0,
      lastY = 0,
      lastScroll = -1,
      scrolledAt = -Infinity,
      presence = 0,
      ground = null,
      light = false;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, GRAIN.maxDpr);
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = bakeGrain(dpr);
    };
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((now - stamp) / 1000, 0.05);
      stamp = now;
      const dx = pointer.px - lastX,
        dy = pointer.py - lastY;
      const moved = dx !== 0 || dy !== 0;
      const scroll = window.scrollY;
      if (scroll !== lastScroll && lastScroll >= 0) scrolledAt = now;
      lastScroll = scroll;
      const target = pointer.active > 0 && now - scrolledAt < GRAIN.ringHoldMs ? 1 : 0;
      const rate = target > presence ? GRAIN.ringRise : GRAIN.ringFall;
      presence += (target - presence) * (1 - Math.exp(-rate * delta));
      const ringing = presence > GRAIN.gone;
      if (!moved && !ringing && pool.alive === 0) return;
      if (moved || ringing) {
        const under = document.elementFromPoint(pointer.px, pointer.py);
        if (under !== ground) {
          ground = under;
          light = under ? groundIsLight(under) : false;
        }
      }
      if (pointer.active > 0) {
        if (moved) shedGrain(pool, pointer.px, pointer.py, dx / delta, dy / delta, Math.hypot(dx, dy), light);
        if (ringing) shedRing(pool, pointer.px, pointer.py, presence, delta, light);
      }
      lastX = pointer.px;
      lastY = pointer.py;
      stepGrain(pool, delta, ringing ? { x: pointer.px, y: pointer.py, presence } : null);
      ctx.clearRect(0, 0, width, height);
      if (pool.alive === 0) return;
      for (let i = 0; i < pool.count; i += 1) {
        if (pool.age[i] >= pool.span[i]) continue;
        const t = pool.age[i] / pool.span[i];
        const size = pool.size[i] * (1 - GRAIN.sizeDecay * t);
        ctx.globalAlpha = GRAIN.alpha * grainFade(t);
        ctx.drawImage(sprites[pool.tint[i]], pool.x[i] - size / 2, pool.y[i] - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };
    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden='true' className='pointer-events-none fixed inset-0 z-20' />;
}
