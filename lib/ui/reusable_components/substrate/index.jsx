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
const PAPER = '#fdfdfb';

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

// The body, walked along its own arc. It is a straight rod bent by one travelling sine, so both the centre and the girth are formulae
// — the same two the vertex shader uses, which is why the wake lines up with what is actually drawn.
const stampSnake = (life, view, posed, crawl) => {
  const length = COSMOS.snakeLength * posed;
  for (let index = 0; index <= 160; index += 1) {
    const t = index / 160;
    const nose = Math.exp(-((t / 0.05) ** 2)) * 0.92;
    const girth = COSMOS.snakeRadius * posed * Math.max(nose, Math.sin(Math.PI * Math.sqrt(t)) * (1 - t * 0.15));
    const centreX = view.offsetX + Math.sin(t * COSMOS.snakeWaves * TAU - crawl) * COSMOS.snakeAmplitude * posed;
    const cell = toGrid(centreX, view.bob + (t - 0.5) * length, view);
    const spread = Math.ceil((girth / (2 * view.viewHalf)) * view.cols);
    for (let offset = -spread; offset <= spread; offset += 1) {
      if (Math.random() > COSMOS.seedChance) continue;
      life.seed(cell.col + offset, cell.row);
    }
  }
};

const paint = (context, life, size, drift) => {
  const { cols, rows, pixels } = life;
  const cell = size.width / cols;
  context.clearRect(0, 0, size.width, size.height);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const glow = pixels[(row * cols + col) * 4 + 1] / 255;
      if (glow < 0.02) continue;
      // The lattice slides and the grid wraps, so a cell leaving one edge reappears at the other and the field reads as travelling.
      const y = (((row - drift) % rows) + rows) % rows;
      context.globalAlpha = glow * COSMOS.substrateOpacity;
      // Only the birth frame is paper. A cell is born at exactly 1 and decays from there, so anything below that stays volt — a wider
      // threshold catches the afterglow too and the whole field reads white.
      context.fillStyle = glow > 0.99 ? PAPER : VOLT;
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
    let frame = 0,
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
      life.resize(Math.max(8, Math.round(width / COSMOS.cell)), Math.max(8, Math.round(height / COSMOS.cell)));
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
        if (stage.form > 0.4) {
          if (stage.pose > 0.5) stampGlyph(life, getCloud(), view, values.uScale.value);
          else stampSnake(life, view, values.uScale.value, values.uCrawl.value);
        }
        life.step(COSMOS.decay, COSMOS.spawn);
      }
      paint(context, life, size, drift);
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
