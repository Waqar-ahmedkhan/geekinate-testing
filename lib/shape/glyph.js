import { sortByAngle } from './order';

// The letterform the cloud reforms into at the foot of the page, sampled as filled area straight off the brand SVG.
//
// This is the opposite problem to the tube in lib/curve: that one needed the G's *centreline* and could not use the filled outline,
// which is why it derives one arithmetically. A particle cloud wants the fill, so here the outline is exactly the right asset and
// rasterising it is the shortest honest route — no path maths, no second copy of the glyph in JS.
//
// The two <rect> elements are the volt tile and its ink keyline. Both are opaque and both would swamp the letter, so they come out
// before the SVG is rasterised. Removing them beats colour-keying the ink pixels, which would also match the keyline.
const RESOLUTION = 560;

const loadGlyphAlpha = async (src, signal) => {
  const markup = await fetch(src, { signal }).then((response) => response.text());
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const root = doc.documentElement;
  root.querySelectorAll('rect').forEach((node) => node.remove());
  root.setAttribute('width', RESOLUTION);
  root.setAttribute('height', RESOLUTION);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(root))}`;
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = RESOLUTION;
  canvas.height = RESOLUTION;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, RESOLUTION, RESOLUTION);
  return context.getImageData(0, 0, RESOLUTION, RESOLUTION).data;
};

// Opaque pixels, plus the box they occupy. The box matters: the mark's G sits low and left inside a 512 viewBox, so centring on the
// canvas instead of on the ink would hang the letterform off-centre behind the footer and read as a layout bug.
const collectInk = (alpha) => {
  const pixels = [];
  let minX = RESOLUTION,
    minY = RESOLUTION,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < RESOLUTION; y += 1) {
    for (let x = 0; x < RESOLUTION; x += 1) {
      if (alpha[(y * RESOLUTION + x) * 4 + 3] < 128) continue;
      pixels.push(x, y);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { pixels, minX, minY, maxX, maxY };
};

// A coarse binary copy of the mark, cropped to its ink and downsampled to a fixed grid. The substrate stamps this into its cells, and
// it wants a shape it can walk cheaply once per generation — not 26,000 particles it would have to project one at a time.
const MASK = 72;

const buildMask = (alpha, minX, minY, maxX, maxY) => {
  const data = new Uint8Array(MASK * MASK);
  const width = maxX - minX || 1,
    height = maxY - minY || 1;
  for (let y = 0; y < MASK; y += 1) {
    for (let x = 0; x < MASK; x += 1) {
      const sx = Math.round(minX + ((x + 0.5) / MASK) * width);
      const sy = Math.round(minY + ((y + 0.5) / MASK) * height);
      data[y * MASK + x] = alpha[(sy * RESOLUTION + sx) * 4 + 3] < 128 ? 0 : 1;
    }
  }
  return { data, size: MASK };
};

// Resolves to null rather than throwing when the asset cannot be read. The morph is the payoff, not the scene — losing it must
// leave the cloud running, not blank the page.
//
// Returns the mark's real half-width alongside the points, because `radius` is not it. The sample is normalised by the *longer* side
// of the ink's box so the mark keeps its proportions, and this G is noticeably taller than it is wide — treating radius as the
// half-width over-reads the silhouette by about a quarter, which is exactly the width of the gap that appeared when the mark was
// aligned to the container's right edge.
export async function sampleGlyph(count, { src, radius, depth, signal }) {
  try {
    const alpha = await loadGlyphAlpha(src, signal);
    const { pixels, minX, minY, maxX, maxY } = collectInk(alpha);
    if (pixels.length < count) return null;
    const total = pixels.length / 2;
    const centreX = (minX + maxX) / 2,
      centreY = (minY + maxY) / 2;
    const half = Math.max(maxX - minX, maxY - minY) / 2;
    const scale = radius / half;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const pick = ((Math.random() * total) | 0) * 2;
      // Jitter inside the source pixel. Without it the cloud lands on a visible lattice at this resolution.
      const x = pixels[pick] + Math.random() - centreX,
        y = pixels[pick + 1] + Math.random() - centreY;
      positions[i * 3] = x * scale;
      positions[i * 3 + 1] = -y * scale;
      positions[i * 3 + 2] = (Math.random() + Math.random() + Math.random() - 1.5) * depth;
    }
    return { points: sortByAngle(positions), halfWidth: ((maxX - minX) / 2) * scale, mask: buildMask(alpha, minX, minY, maxX, maxY) };
  } catch {
    return null;
  }
}
