'use client';

import { useEffect, useRef } from 'react';
import { createGrain, grainFade, shedGrain, shedRing, stepGrain } from './pool';
import { bakeGrain } from './sprite';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { GRAIN } from '@/constants';

// The cursor's grain, in its two states.
//
// Moving the cursor sheds a wake: beads come off it with a share of its velocity, drift, sink and fade. Moving the *page* under a
// still cursor does something else — the same beads are laid onto a circle around the cursor and steered around it, and when the
// scrolling stops the steering switches off and the ring comes apart into the wake it was always made of. One pool, one material,
// one draw call per bead; the only thing that changes between the two is where new beads are put and whether anything is steering
// the ones already out.
//
// **A 2D canvas, not a second WebGL context.** Three hundred blits of a pre-baked 16px sprite is a rounding error next to what a
// second GL context costs — its own driver allocation, its own compile, and a second live surface for the compositor to blend over
// the page every frame while the scene behind is already fill-rate bound and being governed down on weak machines.
//
// **The bead's colour comes from the surface under the cursor, not from the section.** `.on-paper` was the first answer and it does
// not survive this page: Work and Services are white sections carrying ten black cards between them, so a section-level test paints
// ink grain onto a black tile and it disappears — the same failure the token flip exists to prevent, one level further down.
//
// `z-20` puts it over the sections at z-10 and their cards, and under the navbar and footer at z-50. It is grain the cursor leaves
// on the page, so it belongs on top of what the cursor is over — but the pill and the footer panel are chrome, and grain crawling
// across them reads as a bug.
const LIGHT_GROUND = 140;

// Walks up to the first thing that actually paints a ground and reads its luminance, which answers for a card, a section or a volt
// hover state without any of them having to be listed here.
const groundIsLight = (element) => {
  for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
    const parts = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
    if (!parts) continue;
    const [red, green, blue, alpha = 1] = parts.map(Number);
    // Anything this translucent is a tint over whatever is behind it rather than a ground of its own — the glass cards are the case
    // that matters, and taking their colour at face value ignores the section showing through them.
    if (alpha < 0.5) continue;
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue > LIGHT_GROUND;
  }
  return false;
};

export default function GrainWake() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Reduced motion is written by SmoothScroll, which is mounted above this in the shell — sibling effects run in document order, so
    // the flag is settled by the time this reads it. The same ordering note is on CosmosCanvas for the same reason.
    if (!canvas || scrollProgress.reduced) return undefined;
    // Touch is excluded here exactly as it is on the scene's pointer pull and the globe's drag: this is grain shed by a cursor that
    // hovers, and on a touch screen the finger is *on* the thing it would be shedding over.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const ctx = canvas.getContext('2d');
    const pool = createGrain(GRAIN.count);
    let sprites = [],
      width = 0,
      height = 0;
    // Locals rather than refs, deliberately. StrictMode's dev remount runs cleanup and then a second effect with a fresh closure, so
    // there is no stale id to inherit — the frame id that has to be reset to zero is the one kept in a ref across that remount.
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
      // Everything below draws in CSS pixels; this is the only place the device ratio appears. Re-baking on resize is what catches a
      // window dragged onto a display with a different ratio, which would otherwise blit yesterday's sprite at today's scale.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sprites = bakeGrain(dpr);
    };
    // One perpetual loop with a cheap way out, rather than starting and stopping it on pointer and scroll events. A frame that finds
    // the cursor still, the page still and the field empty costs three comparisons; the listener bookkeeping to avoid them costs
    // more than that in ways that go wrong — a stop that races a scroll leaves the layer dead until the next one.
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((now - stamp) / 1000, 0.05);
      stamp = now;
      const dx = pointer.px - lastX,
        dy = pointer.py - lastY;
      const moved = dx !== 0 || dy !== 0;
      // Scroll is read straight off the window. Lenis moves the real scroll position rather than transforming a wrapper, so this is
      // the number it is already driving and there is no need to hold a reference to the instance to ask for it.
      const scroll = window.scrollY;
      if (scroll !== lastScroll && lastScroll >= 0) scrolledAt = now;
      lastScroll = scroll;
      // The ring belongs to the cursor, so it only exists while there is a cursor on the page to put it around.
      const target = pointer.active > 0 && now - scrolledAt < GRAIN.ringHoldMs ? 1 : 0;
      // Exponential rather than linear, and at different rates each way. Framed as `1 - exp(-rate * delta)` so the curve is the same
      // shape whatever the frame rate — a per-frame multiplier tuned on a 60Hz display runs at half speed on a 120Hz one.
      const rate = target > presence ? GRAIN.ringRise : GRAIN.ringFall;
      presence += (target - presence) * (1 - Math.exp(-rate * delta));
      const ringing = presence > GRAIN.gone;
      if (!moved && !ringing && pool.alive === 0) return;
      // The hit test is the only per-frame DOM read here, and the luminance walk behind it runs only when the element under the
      // cursor actually changes — dragging across one card is thousands of frames over a single answer.
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
