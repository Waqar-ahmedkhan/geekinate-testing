'use client';

import { useEffect, useRef, useState } from 'react';
import BrandMark from '../BrandMark';
import { createGrain, grainFade, shedGrain, shedRing, stepGrain } from '../grain/pool';
import { bakeGrain } from '../grain/sprite';
import { openGate } from '@/lib/boot/gate';
import { isPhone } from '@/lib/boot/phone';
import { watchGlobeReady } from '@/lib/boot/ready';
import { pointer } from '@/lib/input/pointer';
import { cn } from '@/lib/utils';
import { GRAIN, PRELOADER } from '@/constants';

const reached = (done) =>
  (done.fonts ? PRELOADER.fontsWeight : 0) + (done.document ? PRELOADER.documentWeight : 0) + (done.globe ? PRELOADER.globeWeight : 0);

export default function Preloader() {
  const canvasRef = useRef(null);
  const countRef = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (isPhone()) {
      openGate();
      const skip = requestAnimationFrame(() => setGone(true));
      return () => cancelAnimationFrame(skip);
    }
    const ctx = canvas.getContext('2d');
    const root = document.documentElement;
    const held = root.style.overflow;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracing = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const pool = createGrain(PRELOADER.grainCount);
    const ring = {
      x: 0,
      y: 0,
      presence: 1,
      radius: PRELOADER.ringRadius,
      orbit: PRELOADER.ringOrbit,
      rate: PRELOADER.ringPerSecond,
      life: PRELOADER.ringLife,
    };
    const cursor = {
      x: 0,
      y: 0,
      radius: PRELOADER.cursorRadius,
      pull: PRELOADER.cursorPull,
      swirl: PRELOADER.cursorSwirl,
      grip: PRELOADER.cursorGrip,
    };
    const done = { fonts: false, document: false, globe: false };
    const started = performance.now();
    let sprites = [],
      width = 0,
      height = 0;
    let frame = 0,
      stamp = 0,
      value = 0,
      finishedAt = 0,
      lastX = 0,
      lastY = 0;
    const markFonts = () => {
      done.fonts = true;
    };
    const markDocument = () => {
      done.document = true;
    };
    const markGlobe = () => {
      done.globe = true;
    };
    const settledAt = (now) =>
      (done.fonts && done.document && done.globe && now - started >= PRELOADER.minMs) || now - started >= PRELOADER.maxMs;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, GRAIN.maxDpr);
      width = root.clientWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = bakeGrain(dpr);
      ring.x = width / 2;
      ring.y = height / 2;
    };
    const paint = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < pool.count; i += 1) {
        if (pool.age[i] >= pool.span[i]) continue;
        const t = pool.age[i] / pool.span[i];
        const heat = pool.hot[i];
        const size = pool.size[i] * PRELOADER.grainScale * (1 - GRAIN.sizeDecay * t) * (1 + heat * PRELOADER.cursorSwell);
        ctx.globalAlpha = Math.min(1, PRELOADER.grainAlpha * grainFade(t) * (1 + heat * PRELOADER.cursorGlow));
        ctx.drawImage(sprites[pool.tint[i]], pool.x[i] - size / 2, pool.y[i] - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const elapsed = (now - stamp) / 1000;
      const delta = Math.min(elapsed, 0.05),
        tick = Math.min(elapsed, PRELOADER.countStepCap);
      stamp = now;
      const settled = settledAt(now);
      const drift = Math.min((now - started) / PRELOADER.maxMs, 1) * PRELOADER.driftCap;
      const goal = settled ? 1 : Math.min(Math.max(reached(done), drift), PRELOADER.creepCap);
      const rate = settled ? PRELOADER.settleRate : PRELOADER.easeRate;
      value += (goal - value) * (1 - Math.exp(-rate * tick));
      if (countRef.current) countRef.current.textContent = `${Math.round(value * 100)}`;
      ring.radius = PRELOADER.ringRadius - value * PRELOADER.ringRadiusPull;
      ring.orbit = PRELOADER.ringOrbit + value * PRELOADER.ringOrbitGain;
      ring.rate = PRELOADER.ringPerSecond + value * PRELOADER.ringRateGain;
      if (!reduced) {
        const dx = pointer.px - lastX,
          dy = pointer.py - lastY;
        if (tracing && pointer.active > 0 && (dx !== 0 || dy !== 0))
          shedGrain(pool, pointer.px, pointer.py, dx / delta, dy / delta, Math.hypot(dx, dy), false);
        lastX = pointer.px;
        lastY = pointer.py;
        cursor.x = pointer.px;
        cursor.y = pointer.py;
        shedRing(pool, ring, delta, false);
        stepGrain(pool, delta, ring, tracing && pointer.active > 0 ? cursor : null);
        paint();
      }
      if (settled && value > 0.999 && !finishedAt) finishedAt = now;
      if (!finishedAt || now - finishedAt < PRELOADER.holdMs) return;
      cancelAnimationFrame(frame);
      frame = 0;
      root.style.overflow = held;
      openGate();
      setLeaving(true);
    };
    root.style.overflow = 'hidden';
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('load', markDocument);
    document.fonts.ready.then(markFonts);
    if (document.readyState === 'complete') markDocument();
    const unwatch = watchGlobeReady(markGlobe);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('resize', resize);
      window.removeEventListener('load', markDocument);
      unwatch();
      root.style.overflow = held;
    };
  }, []);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = setTimeout(() => setGone(true), PRELOADER.fadeMs);
    return () => clearTimeout(timer);
  }, [leaving]);

  if (gone) return null;
  const shell = cn('fixed inset-0 z-[100] bg-black transition-opacity ease-out max-md:hidden', leaving && 'pointer-events-none opacity-0');
  return (
    <div aria-hidden='true' className={shell} style={{ transitionDuration: `${PRELOADER.fadeMs}ms` }}>
      <canvas ref={canvasRef} className='absolute inset-0' />
      <div className='absolute inset-0 flex items-center justify-center'>
        <BrandMark size={PRELOADER.markSize} />
      </div>
      <span className='absolute right-6 bottom-6 font-mono text-sm text-paper md:right-10 md:bottom-10 md:text-base'>
        <span ref={countRef}>0</span> %
      </span>
    </div>
  );
}
