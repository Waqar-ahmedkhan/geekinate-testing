// The bead, baked once into two small canvases — one ink, one volt — and blitted per particle after that.
//
// It is the same read as the beads in the WebGL scene, arrived at differently. There every particle is a fragment shader with a
// darkened core and a feathered rim, and that core is what separates one grain from the next instead of letting the field collapse
// into haze. There is no shader here, so the core is baked into the gradient: solid at the centre, still dense at a third of the
// radius, gone by the edge.
//
// Colours are read from the stylesheet rather than typed in. The palette is transcribed from the logo file and lives in :root; a
// second copy of #101613 in a JS module is a second place for it to be wrong.
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
  // The volt and paper beads get a dark centre painted back over them; the ink one does not. Both of those are brighter than the
  // ground they sit on, and a field of them flattens into one smear without something to break each grain from its neighbour —
  // which is the same job `beadCore` does in the WebGL scene's shader. The ink bead is already the darkest thing on a paper section
  // and needs no help separating.
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

// Indexed by the pool's `tint`: 0 ink, 1 volt, 2 paper. Baked at device resolution and drawn at CSS-pixel sizes, so a bead is
// always downsampled rather than stretched.
export function bakeGrain(dpr) {
  const ink = token('--ink', FALLBACK.ink);
  const volt = token('--volt', FALLBACK.volt);
  const paper = token('--white', FALLBACK.paper);
  const side = Math.round(GRAIN.spriteSize * dpr);
  return [bead(ink, side, null), bead(volt, side, ink), bead(paper, side, ink)];
}
