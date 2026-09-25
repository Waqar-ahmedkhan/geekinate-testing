import { angleOrder, applyOrder } from './order';
import { nextTask } from '@/lib/utils';

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

const HALF_TURN = Math.PI / 2;
const clampIndex = (value) => Math.min(RESOLUTION - 1, Math.max(0, value));
const heightAt = (field, x, y, crest, depth) =>
  depth * Math.sin(Math.min(1, field[clampIndex(y) * RESOLUTION + clampIndex(x)] / crest) * HALF_TURN);

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

export async function sampleGlyph(count, { src, radius, depth, frayed, signal }) {
  try {
    const alpha = await loadGlyphAlpha(src, signal);
    await nextTask();
    const { pixels, minX, minY, maxX, maxY } = collectInk(alpha);
    if (pixels.length < count) return null;
    const total = pixels.length / 2;
    const centreX = (minX + maxX) / 2,
      centreY = (minY + maxY) / 2;
    const half = Math.max(maxX - minX, maxY - minY) / 2;
    const scale = radius / half;
    await nextTask();
    const field = distanceField(alpha);
    await nextTask();
    let crest = 1;
    for (let index = 0; index < total; index += 1) crest = Math.max(crest, field[pixels[index * 2 + 1] * RESOLUTION + pixels[index * 2]]);
    const positions = new Float32Array(count * 3),
      normals = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const pick = ((Math.random() * total) | 0) * 2;
      const sourceX = pixels[pick],
        sourceY = pixels[pick + 1];
      const x = sourceX + Math.random() - centreX,
        y = sourceY + Math.random() - centreY;
      const lift = heightAt(field, sourceX, sourceY, crest, depth) + (Math.random() - 0.5) * depth * 0.12;
      const fray = Math.random() ** 4 * frayed,
        drift = Math.random() * TAU,
        tumble = Math.random() * 2 - 1;
      positions[i * 3] = x * scale + Math.cos(drift) * fray;
      positions[i * 3 + 1] = -y * scale + Math.sin(drift) * fray;
      positions[i * 3 + 2] = lift + tumble * fray;
      const slopeX =
        (heightAt(field, sourceX + 1, sourceY, crest, depth) - heightAt(field, sourceX - 1, sourceY, crest, depth)) / (2 * scale);
      const slopeY =
        (heightAt(field, sourceX, sourceY + 1, crest, depth) - heightAt(field, sourceX, sourceY - 1, crest, depth)) / (2 * scale);
      const length = Math.hypot(slopeX, slopeY, 1);
      normals[i * 3] = -slopeX / length;
      normals[i * 3 + 1] = slopeY / length;
      normals[i * 3 + 2] = 1 / length;
    }
    await nextTask();
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
