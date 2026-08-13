import { angleOrder, applyOrder } from './order';

// The letterform the cloud reforms into at the foot of the page, sampled as filled area straight off the brand SVG.
//
// This is the opposite problem to the tube in lib/curve: that one needed the G's *centreline* and could not use the filled outline,
// which is why it derives one arithmetically. A particle cloud wants the fill, so here the outline is exactly the right asset and
// rasterising it is the shortest honest route — no path maths, no second copy of the glyph in JS.
//
// The two <rect> elements are the volt tile and its ink keyline. Both are opaque and both would swamp the letter, so they come out
// before the SVG is rasterised. Removing them beats colour-keying the ink pixels, which would also match the keyline.
const RESOLUTION = 560;
const TAU = Math.PI * 2;

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

// How far inside the ink every pixel sits, by chamfer distance transform — two sweeps, forward and back, propagating the cheapest
// route to the nearest background pixel. 3-4 chamfer weights (1 orthogonal, sqrt(2) diagonal) are within a couple of percent of the
// true Euclidean distance, which is far tighter than anything here needs.
//
// This is the whole basis of the mark's depth. Random z jitter is what a flat logo had before, and it cannot read as solid however
// far it is turned up: it scatters the silhouette across a band instead of a line, which is why it had been dialled down to almost
// nothing. Depth taken from the distance instead puts the edge of every stroke at z = 0 and lifts only the middle, so the letterform
// gains a rounded surface and its outline stays exactly as sharp as it was.
const DIAGONAL = Math.SQRT2;

const distanceField = (alpha) => {
  const size = RESOLUTION;
  const field = new Float32Array(size * size);
  for (let index = 0; index < field.length; index += 1) field[index] = alpha[index * 4 + 3] < 128 ? 0 : Infinity;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      if (field[index] === 0) continue;
      let best = field[index];
      if (y > 0) {
        best = Math.min(best, field[index - size] + 1);
        if (x > 0) best = Math.min(best, field[index - size - 1] + DIAGONAL);
        if (x < size - 1) best = Math.min(best, field[index - size + 1] + DIAGONAL);
      }
      if (x > 0) best = Math.min(best, field[index - 1] + 1);
      field[index] = best;
    }
  }
  for (let y = size - 1; y >= 0; y -= 1) {
    for (let x = size - 1; x >= 0; x -= 1) {
      const index = y * size + x;
      if (field[index] === 0) continue;
      let best = field[index];
      if (y < size - 1) {
        best = Math.min(best, field[index + size] + 1);
        if (x > 0) best = Math.min(best, field[index + size - 1] + DIAGONAL);
        if (x < size - 1) best = Math.min(best, field[index + size + 1] + DIAGONAL);
      }
      if (x < size - 1) best = Math.min(best, field[index + 1] + 1);
      field[index] = best;
    }
  }
  return field;
};

// The profile the stroke is extruded to, across its own half-width: 0 at the edge, `depth` along the centre line. A sine quarter
// gives a dome that meets the crest flat and the edge at a finite angle — a circular arc reads better in a drawing but its wall is
// vertical at the edge, and a vertical wall has no normal worth lighting.
const HALF_TURN = Math.PI / 2;
const clampIndex = (value) => Math.min(RESOLUTION - 1, Math.max(0, value));
const heightAt = (field, x, y, crest, depth) =>
  depth * Math.sin(Math.min(1, field[clampIndex(y) * RESOLUTION + clampIndex(x)] / crest) * HALF_TURN);

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
export async function sampleGlyph(count, { src, radius, depth, frayed, signal }) {
  try {
    const alpha = await loadGlyphAlpha(src, signal);
    const { pixels, minX, minY, maxX, maxY } = collectInk(alpha);
    if (pixels.length < count) return null;
    const total = pixels.length / 2;
    const centreX = (minX + maxX) / 2,
      centreY = (minY + maxY) / 2;
    const half = Math.max(maxX - minX, maxY - minY) / 2;
    const scale = radius / half;
    const field = distanceField(alpha);
    // The deepest point in the ink, which on a uniform-stroke mark like this one is the half-width of the stroke. Normalising by it
    // means the profile reaches full depth along every centre line rather than only at the thickest join.
    let crest = 1;
    for (let index = 0; index < total; index += 1) crest = Math.max(crest, field[pixels[index * 2 + 1] * RESOLUTION + pixels[index * 2]]);
    const positions = new Float32Array(count * 3),
      normals = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const pick = ((Math.random() * total) | 0) * 2;
      const sourceX = pixels[pick],
        sourceY = pixels[pick + 1];
      // Jitter inside the source pixel. Without it the cloud lands on a visible lattice at this resolution.
      const x = sourceX + Math.random() - centreX,
        y = sourceY + Math.random() - centreY;
      // Particles sit on the front face only, so the mark is a raised surface rather than a slab with a hidden half. Nothing is
      // depth-tested here, so a back face would paint through the front in a random order and read as noise, not as thickness.
      // The jitter keeps it from looking like a perfect membrane.
      const lift = heightAt(field, sourceX, sourceY, crest, depth) + (Math.random() - 0.5) * depth * 0.12;
      // A few particles thrown clear of the surface, so the letterform has a loose edge rather than a die-cut one.
      //
      // This is the cost of the rounded profile, paid back deliberately. Random z jitter used to scatter the silhouette across a
      // band, which is why the depth had to stay near zero — pinning every edge particle to z = 0 is what let the mark gain real
      // volume. It also made the outline perfectly sharp, and the mark lost the frayed, hand-strewn quality it had. The fourth power
      // is what keeps this from undoing the sharpness: almost every roll lands near nothing and only a handful reach far, so the
      // silhouette stays a line with a scatter of particles around it rather than turning back into a band.
      const fray = Math.random() ** 4 * frayed,
        drift = Math.random() * TAU,
        tumble = Math.random() * 2 - 1;
      positions[i * 3] = x * scale + Math.cos(drift) * fray;
      positions[i * 3 + 1] = -y * scale + Math.sin(drift) * fray;
      positions[i * 3 + 2] = lift + tumble * fray;
      // The surface normal of that face, by central difference on the profile. Pixel gradients become world gradients by dividing
      // through the scale, and the y term keeps its sign because world y runs opposite to the raster's.
      const slopeX =
        (heightAt(field, sourceX + 1, sourceY, crest, depth) - heightAt(field, sourceX - 1, sourceY, crest, depth)) / (2 * scale);
      const slopeY =
        (heightAt(field, sourceX, sourceY + 1, crest, depth) - heightAt(field, sourceX, sourceY - 1, crest, depth)) / (2 * scale);
      const length = Math.hypot(slopeX, slopeY, 1);
      normals[i * 3] = -slopeX / length;
      normals[i * 3 + 1] = slopeY / length;
      normals[i * 3 + 2] = 1 / length;
    }
    // One order, applied to both. A normal permuted differently from its own position is worse than no normal at all — the lighting
    // would be coherent per particle and incoherent across the mark.
    const order = angleOrder(positions);
    return {
      points: applyOrder(positions, order, 3),
      normals: applyOrder(normals, order, 3),
      halfWidth: ((maxX - minX) / 2) * scale,
      mask: buildMask(alpha, minX, minY, maxX, maxY),
    };
  } catch {
    return null;
  }
}
