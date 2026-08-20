'use client';

import { useEffect, useRef } from 'react';
import { createLife } from '../cosmos/automata';
import { getCloud } from '../cosmos/cloud';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { SUBSTRATE } from '@/constants';

// The Life field the footer's letterform stands in.
//
// This is the 2026-08-11 substrate brought back on 2026-08-20, cut down to the one job that was wanted. The original was the ground
// the whole page composited onto: it painted the white bands for the light sections, published `stage.light` for the mark's shading,
// and ran a column mask so the hero's reading column stayed clear. All of that went with the light hero, and none of it is wanted
// here — restoring it whole would repaint white over sections that now carry their own grounds. What is left is the automata, in the
// right half of the footer panel, seeded by the mark standing in it.
//
// **Fixed at z-0, behind the scene, rather than inside the footer.** It was in the panel first and that put it over the letterform:
// the footer is z-50, the particle scene is z-[1], so anything parented in the panel paints on top of the mark no matter what it is
// given locally. Sitting under the scene is the only place it can be and still be behind the G. The cost is that the panel's own
// `bg-void/30` tint now sits over the field as well, which `opacity` below is set against.
//
// It is clipped to the panel's right half per frame rather than confined by layout, because a fixed layer has no layout to be
// confined by. The rule still runs across the whole grid, so patterns drift in and out of the clip and the field reads as part of
// something larger rather than as a patch that stops.
//
// **A 2D canvas, not part of the WebGL scene.** Same reason as the original: the rule was built inside the scene twice, once as a
// GPU ping-pong and once as a DataTexture on a display plane, and neither ever painted while the identical automata drew correctly
// on a 2D canvas. The arithmetic makes it moot anyway — this grid is about 49 x 55, so a generation is under three thousand cells
// against a particle shader doing 26,000 vertices sixty times a second.
const TAU = Math.PI * 2;
const VOLT = '#b8e01b';
const GREY = '#5b6b62';
const RAMP_STEPS = 8;
// The panel splits at `lg`, so the field does. Below it the mark drifts back toward the middle of the frame and a field pinned to
// one side would sit beside the letterform rather than behind it.
const SPLIT = 1024;

// The field is green and grey and nothing else. Fading volt toward grey as a cell dies keeps the birth frame legible as the live
// edge of the rule without any of it reaching white — a white speckle behind the mark would be the brightest moving thing on the
// panel, which is the mark's job.
//
// Precomputed as a short ramp rather than mixed per dot: this loop runs over every lit cell every frame, and a fillStyle string
// built inside it is the one allocation here that would actually cost something.
const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const mix = (from, to, amount) => `rgb(${from.map((value, index) => Math.round(value + (to[index] - value) * amount)).join(',')})`;
const RAMP = Array.from({ length: RAMP_STEPS }, (unused, index) => mix(channels(GREY), channels(VOLT), index / (RAMP_STEPS - 1)));

// Where the field is allowed to paint: the footer panel, or its right half once the panel splits. Returned in viewport coordinates
// because that is what the fixed canvas draws in, and null when the panel is off screen so the caller can skip the frame whole.
const readBox = (panel, height) => {
  const rect = panel.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= height || rect.width === 0) return null;
  const split = window.innerWidth >= SPLIT ? rect.width / 2 : 0;
  return { x: rect.left + split, y: rect.top, width: rect.width - split, height: rect.height };
};

// The letterform, stamped from the coarse 72 x 72 mask rasterised alongside the particles. Walking that bitmap once a generation
// costs nothing; projecting 26,000 particles individually would cost far more and land in the same cells.
//
// The mark is centred in the box rather than projected through the camera, and that holds because of what the box is: MorphCloud
// puts the mark in the middle of the panel's right half, and this is the middle of the panel's right half. Both are solving the same
// placement from the same numbers, so the cheap answer and the projected one agree wherever the footer is being looked at.
const stampGlyph = (life, mask, posed, headroom) => {
  if (!mask) return;
  // The mask is cropped to the mark's ink, so its own aspect carries the letterform's proportions and the height alone scales it.
  const half = (life.rows * posed) / 2;
  const chance = SUBSTRATE.seedChance * headroom;
  for (let y = 0; y < mask.size; y += 1) {
    for (let x = 0; x < mask.size; x += 1) {
      if (!mask.data[y * mask.size + x] || Math.random() > chance) continue;
      const col = life.cols / 2 + (((x + 0.5) / mask.size) * 2 - 1) * half;
      const row = life.rows / 2 + (((y + 0.5) / mask.size) * 2 - 1) * half;
      life.seed(Math.round(col), Math.round(row));
    }
  }
};

// The lattice does not move. The original slid it with the scroll and with the clock, which is what made the page-wide field read as
// a wake trailing the mark down the page; here the mark is standing still in a panel and the same drift reads as the whole field
// being lifted out of the frame. The rule's own churn is the motion now.
const paint = (context, life, box) => {
  const { cols, rows, pixels } = life;
  const cell = box.width / cols;
  context.save();
  context.beginPath();
  context.rect(box.x, box.y, box.width, box.height);
  context.clip();
  context.translate(box.x, box.y);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const glow = pixels[(row * cols + col) * 4 + 1] / 255;
      if (glow < SUBSTRATE.gone) continue;
      context.globalAlpha = glow * SUBSTRATE.opacity;
      // A cell is born at exactly 1 and decays from there, so glow doubles as the ramp index: live cells sit at the volt end and the
      // afterglow walks down toward grey as it goes out.
      context.fillStyle = RAMP[Math.min(RAMP_STEPS - 1, Math.floor(glow * RAMP_STEPS))];
      context.beginPath();
      context.arc((col + 0.5) * cell, (row + 0.5) * cell, cell * SUBSTRATE.dotSize * (0.45 + glow * 0.55), 0, TAU);
      context.fill();
    }
  }
  context.globalAlpha = 1;
  context.restore();
};

export default function SubstrateField() {
  const canvas = useRef(null);

  useEffect(() => {
    const element = canvas.current;
    // Reduced motion takes the field away rather than freezing it. A still Life grid is a dot screen behind the wordmark, which is a
    // texture nobody asked for; the panel is better off plain. SmoothScroll writes the flag and is mounted above this in the shell.
    if (!element || scrollProgress.reduced) return undefined;
    const panel = document.querySelector('footer > div');
    if (!panel) return undefined;
    const context = element.getContext('2d');
    const life = createLife();
    const size = { width: 0, height: 0 };
    const grid = { width: 0, height: 0 };
    let frame = 0,
      last = 0,
      clock = 0,
      visible = false;
    // The loop is scheduled by an observer rather than running the length of the page. This is the last screen of the site and the
    // field is only ever seen there, so stepping the rule while somebody is reading the hero is work with nothing on the other end.
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    });
    // The canvas is the viewport; the grid is the clip box inside it. Both are measured in the loop rather than once on mount,
    // because a first measurement can land before CSS has laid anything out — a zero there sizes the grid to nothing and the field
    // never appears, with no error to point at it.
    const measure = (box) => {
      const width = document.documentElement.clientWidth,
        height = window.innerHeight;
      if (width !== size.width || height !== size.height) {
        size.width = width;
        size.height = height;
        element.width = width;
        element.height = height;
      }
      if (Math.round(box.width) === grid.width && Math.round(box.height) === grid.height) return;
      grid.width = Math.round(box.width);
      grid.height = Math.round(box.height);
      // resize reports whether it actually reallocated, which is the one moment the grid is empty and needs something to run on.
      const cols = Math.max(8, Math.round(box.width / SUBSTRATE.cell)),
        rows = Math.max(8, Math.round(box.height / SUBSTRATE.cell));
      if (life.resize(cols, rows)) life.scatter(SUBSTRATE.seedDensity);
    };
    function tick(now) {
      if (!visible) {
        frame = 0;
        return;
      }
      frame = requestAnimationFrame(tick);
      const box = readBox(panel, window.innerHeight);
      if (!box) return;
      measure(box);
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      clock += delta;
      const interval = 1 / SUBSTRATE.stepRate;
      if (clock >= interval) {
        clock %= interval;
        // The governor, and without it this field has no steady state. Both sources of life here are external — the mark is stamped
        // into the grid every generation and cells appear spontaneously on top of that — so the rule is being fed faster than its own
        // ash dies back, and the field creeps from sparse at the first look to solid a minute later. It read as correct on arrival
        // and wrong to anyone who stayed.
        //
        // The page-wide original never showed this because it drifted: the lattice slid under the stamp, so a seeded cell was pushed
        // out of the seeded region and the injection was spread over the whole grid instead of piling into one place. The drift is
        // gone by request, so the bound has to be explicit.
        //
        // Closing both taps rather than culling cells. B3/S23 left alone falls back to its own ash, so cutting the supply is enough
        // to bring the field down, and it comes down the way the rule would take it down rather than by having holes punched in it.
        //
        // Throttled on approach rather than switched off at the line. A hard cut overshoots badly: what is already seeded keeps
        // growing for several generations after the tap closes, so the field sails past the cap to about twice it and then falls
        // back, and the cycle reads as the density breathing. Scaling the supply by the headroom left instead means the field slows
        // as it fills and settles onto the number rather than bouncing off it.
        const headroom = Math.max(0, 1 - life.population / (life.cols * life.rows * SUBSTRATE.density));
        // Only an assembled mark leaves a wake. Mid-handover the particles are a loose cloud with no silhouette worth stamping, and
        // seeding off it would smear a rectangle of cells across the panel.
        if (stage.form > 0.4) stampGlyph(life, getCloud().mask, getCloud().uniforms.uScale.value, headroom);
        life.step(SUBSTRATE.decay, SUBSTRATE.spawn * headroom);
      }
      context.clearRect(0, 0, size.width, size.height);
      paint(context, life, box);
    }
    watcher.observe(panel);
    return () => {
      watcher.disconnect();
      cancelAnimationFrame(frame);
      // Back to 0, because StrictMode remounts in dev and a stale non-zero id makes the second mount skip scheduling.
      frame = 0;
    };
  }, []);

  return <canvas ref={canvas} aria-hidden='true' className='pointer-events-none fixed inset-0 z-0' />;
}
