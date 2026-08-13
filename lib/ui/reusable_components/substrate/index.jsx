'use client';

import { useEffect, useRef } from 'react';
import { createLife } from '../cosmos/automata';
import { getCloud } from '../cosmos/cloud';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { COSMOS } from '@/constants';

// The substrate is a plain 2D canvas, not part of the WebGL scene.
//
// It was built inside the scene twice — once as a GPU ping-pong, once as a DataTexture on a display plane — and neither painted,
// while the identical automata drew correctly on a 2D canvas at /lab. The plane itself was proven to render; only the texture read
// came back empty. Rather than keep guessing at renderer state, the background moved to the surface that demonstrably works.
//
// It costs nothing to be here. The grid is about 119 x 53, one generation is under a million operations at eleven a second, and the
// paint is a few hundred filled arcs — against a WebGL layer that draws 26,000 particles every frame on top of it.
const HALF_FOV = (COSMOS.cameraFov * Math.PI) / 360;
const VISIBLE_HEIGHT = 2 * COSMOS.cameraZ * Math.tan(HALF_FOV);
const TAU = Math.PI * 2;
const VOLT = '#b8e01b';
const GREY = '#5b6b62';
const PAPER = '#fdfdfb';
const RAMP_STEPS = 8;

// The field is green and grey and nothing else. Newly born cells used to paint paper, which put a white speckle across the whole
// screen — the brightest thing on the page, moving, behind the copy. Fading volt toward grey as a cell dies keeps the birth frame
// legible as the live edge of the rule without any of it reaching white.
//
// Precomputed as a short ramp rather than mixed per dot: this loop runs over every lit cell every frame, and a fillStyle string
// built inside it is the one allocation here that would actually cost something.
const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const mix = (from, to, amount) => `rgb(${from.map((value, index) => Math.round(value + (to[index] - value) * amount)).join(',')})`;
const RAMP = Array.from({ length: RAMP_STEPS }, (_, index) => mix(channels(GREY), channels(VOLT), index / (RAMP_STEPS - 1)));

// World coordinates to grid coordinates, in the drifted frame the paint uses — which is what makes the wake pull away from the mark
// rather than sitting under it.
const toGrid = (worldX, worldY, view) => ({
  col: Math.round((0.5 + worldX / (2 * view.viewHalf)) * view.cols),
  row: Math.round((0.5 - worldY / VISIBLE_HEIGHT) * view.rows + view.drift),
});

// The letterform, stamped from the coarse mask rasterised alongside the particles. Walking a 72 x 72 bitmap once a generation costs
// nothing; projecting 26,000 particles individually would cost far more and land in the same cells.
const stampGlyph = (life, cloud, view, posed) => {
  const mask = cloud.mask;
  if (!mask) return;
  const halfWidth = cloud.halfWidth * posed,
    halfHeight = COSMOS.glyphRadius * posed;
  for (let y = 0; y < mask.size; y += 1) {
    for (let x = 0; x < mask.size; x += 1) {
      if (!mask.data[y * mask.size + x] || Math.random() > COSMOS.seedChance) continue;
      const worldX = view.offsetX + (((x + 0.5) / mask.size) * 2 - 1) * halfWidth;
      const worldY = view.bob + (1 - ((y + 0.5) / mask.size) * 2) * halfHeight;
      const cell = toGrid(worldX, worldY, view);
      life.seed(cell.col, cell.row);
    }
  }
};

// The hero's paper ground, painted here rather than on `html` or on the section itself.
//
// Neither of those works. The section sits at z-10 above this canvas and the mark's, so a fill on it hides the scene it exists to
// show. And `html` is the ground the whole page composites onto: Services is bg-void/70 and the footer bg-void/30, both translucent
// so the mark reads through them, so a white page ground turns the two dark surfaces into grey. This canvas is already below the
// mark, already fixed to the viewport and already painting every frame — one fillRect makes it the ground as well.
//
// Painted per light section, to its own measured box, and never faded over a scroll range. A band has to end exactly where its
// section does — a pixel short and a strip of the void shows through, which is what a scroll-progress fade produced along the top of
// the Work section. Whole pixels for the same reason: a fractional edge antialiases into the ground behind and paints a hairline.
const wash = (context, size, bands) => {
  context.clearRect(0, 0, size.width, size.height);
  context.fillStyle = PAPER;
  bands.forEach(([top, bottom]) => context.fillRect(0, top, size.width, bottom - top));
};

// How much of the field survives at each column, left to right.
//
// The hero is a column of type on the left and the mark on the right, and the wake was running under both — over the headline it is
// texture behind text, which is where "excessive" comes from however far the density is turned down. Emptying the reading column and
// leaving the field around the mark is a different fix from thinning it everywhere, and it is the one that was asked for.
//
// Masked at paint, not in the rule. The automata keep running across the full grid, so patterns still drift in and out of the visible
// half and the right-hand field looks like part of something larger rather than like a patch that stops.
const columnMask = (cols) =>
  Float32Array.from({ length: cols }, (unused, col) => {
    const t = Math.min(1, Math.max(0, ((col + 0.5) / cols - COSMOS.maskStart) / (COSMOS.maskEnd - COSMOS.maskStart)));
    return t * t * (3 - 2 * t);
  });

const paint = (context, life, size, drift, bands, onLight, mask) => {
  const { cols, rows, pixels } = life;
  const cell = size.width / cols;
  // Each ground gets its own opacity, so tuning the light sections cannot quietly retune Services and the footer — they are on
  // opposite sides of this number. One value for the whole frame rather than one per row: the light sections and the dark ones are
  // a screen tall each, so the two are only ever on screen together across a single boundary, and at 0.38 against 0.44 there is not
  // enough between them for the changeover to register.
  const opacity = onLight ? COSMOS.substrateOpacityLight : COSMOS.substrateOpacity;
  wash(context, size, bands);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      // The mask belongs to the light sections, which are the ones the field sits behind rather than under. The dark sections carry
      // their own fill over it, so there is no reading column to clear there and a right-weighted wake would only look lopsided.
      const share = onLight ? mask[col] : 1;
      if (share < 0.01) continue;
      const glow = pixels[(row * cols + col) * 4 + 1] / 255;
      if (glow < 0.02) continue;
      // The lattice slides and the grid wraps, so a cell leaving one edge reappears at the other and the field reads as travelling.
      const y = (((row - drift) % rows) + rows) % rows;
      context.globalAlpha = glow * opacity * share;
      // A cell is born at exactly 1 and decays from there, so glow doubles as the ramp index: live cells sit at the volt end and the
      // afterglow walks down toward grey as it goes out.
      context.fillStyle = RAMP[Math.min(RAMP_STEPS - 1, Math.floor(glow * RAMP_STEPS))];
      context.beginPath();
      context.arc((col + 0.5) * cell, (y + 0.5) * cell, cell * COSMOS.dotSize * (0.45 + glow * 0.55), 0, TAU);
      context.fill();
    }
  }
  context.globalAlpha = 1;
};

export default function SubstrateCanvas() {
  const canvas = useRef(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element.getContext('2d');
    const life = createLife();
    const size = { width: 0, height: 0 };
    // Read live rather than cached, because everything that would invalidate a cached value happens silently here: fonts swap, the
    // hero is min-h-svh so the mobile URL bar resizes it, and Lenis drives the scroll position itself. One rect read a frame against
    // a loop that already walks several thousand cells is not the cost worth avoiding.
    const sections = [...document.querySelectorAll('.on-light')];
    // Outward to whole pixels at both edges, for the hairline reason in `wash`. Adjacent sections then overlap by at most a pixel,
    // which is two identical whites over each other and invisible.
    const lightBands = () =>
      sections
        .map((node) => node.getBoundingClientRect())
        .map((box) => [Math.max(0, Math.floor(box.top)), Math.min(size.height, Math.ceil(box.bottom))])
        .filter(([top, bottom]) => bottom > top);
    let mask = columnMask(1),
      frame = 0,
      last = 0,
      clock = 0;
    // Measured inside the loop, not once on mount. The canvas is laid out by CSS and its first measurement can land before that has
    // happened — a zero there sizes the grid to nothing and the field never appears, with no error to point at it.
    const measure = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      if (width === size.width && height === size.height) return;
      size.width = width;
      size.height = height;
      element.width = width;
      element.height = height;
      // resize reports whether it actually reallocated, which is the one moment the grid is empty and needs something to run on.
      const allocated = life.resize(Math.max(8, Math.round(width / COSMOS.cell)), Math.max(8, Math.round(height / COSMOS.cell)));
      if (!allocated) return;
      life.scatter(COSMOS.seedDensity);
      mask = columnMask(life.cols);
    };
    const tick = (now) => {
      measure();
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      clock += delta;
      // The lattice drifts with the scroll and, more slowly, with the clock — so the wake pulls away from the mark as the page moves,
      // and the field is still travelling when the page is not. In rows, which is the unit both the stamp and the paint work in.
      const drift = (scrollProgress.raw * COSMOS.wake + (now / 1000) * COSMOS.wakeIdle) * life.rows;
      const interval = 1 / COSMOS.stepRate;
      if (clock >= interval) {
        clock %= interval;
        const values = getCloud().uniforms;
        const view = {
          cols: life.cols,
          rows: life.rows,
          drift,
          viewHalf: (VISIBLE_HEIGHT * (size.width / size.height)) / 2,
          offsetX: values.uOffsetX.value,
          bob: values.uBob.value,
        };
        // Only an assembled mark leaves a wake. Mid-handover the particles are a loose cloud with no silhouette worth stamping, and
        // seeding off it would smear a rectangle of cells across the page.
        if (stage.form > 0.4) stampGlyph(life, getCloud(), view, values.uScale.value);
        life.step(COSMOS.decay, COSMOS.spawn);
      }
      const bands = lightBands();
      // Taken at the middle of the viewport rather than from whether any band is visible at all, because this answers a question
      // about the mark and the mark sits on that line. A sliver of a light section at the far edge of the screen is not the ground
      // the mark is being seen against.
      const middle = size.height / 2;
      const onLight = bands.some(([top, bottom]) => middle >= top && middle <= bottom);
      // Published for the mark, which shades its particles against whichever ground it is over — see the highlight note in shaders.
      stage.light = onLight ? 1 : 0;
      paint(context, life, size, drift, bands, onLight, mask);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // The id has to go back to 0. StrictMode remounts in dev, and a stale non-zero id makes the second mount skip scheduling.
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
  }, []);

  return <canvas ref={canvas} aria-hidden='true' className='pointer-events-none fixed inset-0 z-0 size-full' />;
}
