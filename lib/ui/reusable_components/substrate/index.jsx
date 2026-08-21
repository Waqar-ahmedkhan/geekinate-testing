'use client';

import { useEffect, useRef } from 'react';
import { createLife } from '../cosmos/automata';
import { getCloud } from '../cosmos/cloud';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { SUBSTRATE } from '@/constants';

const TAU = Math.PI * 2;
const VOLT = '#b8e01b';
const GREY = '#5b6b62';
const RAMP_STEPS = 8;
const SPLIT = 1024;

const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
const mix = (from, to, amount) => `rgb(${from.map((value, index) => Math.round(value + (to[index] - value) * amount)).join(',')})`;
const RAMP = Array.from({ length: RAMP_STEPS }, (unused, index) => mix(channels(GREY), channels(VOLT), index / (RAMP_STEPS - 1)));

const readBox = (panel, height) => {
  const rect = panel.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= height || rect.width === 0) return null;
  const split = window.innerWidth >= SPLIT ? rect.width / 2 : 0;
  return { x: rect.left + split, y: rect.top, width: rect.width - split, height: rect.height };
};

const stampGlyph = (life, mask, posed, headroom) => {
  if (!mask) return;
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
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    });
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
        const headroom = Math.max(0, 1 - life.population / (life.cols * life.rows * SUBSTRATE.density));
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
      frame = 0;
    };
  }, []);

  return <canvas ref={canvas} aria-hidden='true' className='pointer-events-none fixed inset-0 z-0' />;
}
