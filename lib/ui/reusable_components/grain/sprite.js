import { GRAIN } from '@/constants';

const FALLBACK = { ink: [16, 22, 19], volt: [184, 224, 27], paper: [253, 253, 251] };

const parseHex = (value) => {
  const hex = value.trim();
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
  return [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
};

const token = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return parseHex(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
};

const bead = (rgb, side, core) => {
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  const mid = side / 2;
  const fill = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid);
  const [r, g, b] = rgb;
  fill.addColorStop(0, `rgba(${r},${g},${b},1)`);
  fill.addColorStop(0.34, `rgba(${r},${g},${b},0.88)`);
  fill.addColorStop(0.62, `rgba(${r},${g},${b},0.34)`);
  fill.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, side, side);
  if (core) {
    const [ir, ig, ib] = core;
    const dot = ctx.createRadialGradient(mid, mid, 0, mid, mid, mid * 0.4);
    dot.addColorStop(0, `rgba(${ir},${ig},${ib},0.42)`);
    dot.addColorStop(1, `rgba(${ir},${ig},${ib},0)`);
    ctx.fillStyle = dot;
    ctx.fillRect(0, 0, side, side);
  }
  return canvas;
};

export function bakeGrain(dpr) {
  const ink = token('--ink', FALLBACK.ink);
  const volt = token('--volt', FALLBACK.volt);
  const paper = token('--white', FALLBACK.paper);
  const side = Math.round(GRAIN.spriteSize * dpr);
  return [bead(ink, side, null), bead(volt, side, ink), bead(paper, side, ink)];
}
