// The globe pose: where each of the mark's particles sits when the cloud is wearing the Earth.
//
// This is a *pose*, not a scene. The hero globe and the footer letterform are the same 26,000 particles in the same buffer — see
// lib/ui/reusable_components/cosmos/cloud. That is why this returns a bare unit-sphere position array of an exact length rather than
// a geometry: the caller owns the buffer and this only fills one attribute of it.
//
// There is no mesh of links between the dots any more. The reference draws one and the first build copied it, but a static
// LineSegments cannot follow particles that morph, drift and lift under the cursor — the lines sat still while the field moved off
// them. It was also the one element that read as stock illustration rather than as this site's own material: the mark is particles
// and nothing else, and so is the globe now.
import { LAND } from './land';
import { onSphere } from './sphere';
import { sortByAngle } from '@/lib/shape/order';

const CELL_LON = 360 / LAND.width;
const CELL_LAT = 180 / LAND.height;
const DEG = Math.PI / 180;

// The mask is base64 of a bitset, LSB first inside each byte — see scripts/build-land-mask.mjs. Unpacked once and held, because
// StrictMode remounts the scene in dev and rebuilding 16KB of bitset per mount is free work nobody asked for.
let bytes = null;

const unpack = () => {
  if (bytes) return bytes;
  const binary = atob(LAND.bits);
  bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes;
};

const isLand = (index) => (unpack()[index >> 3] >> (index & 7)) & 1;

// Every land cell with the area it actually covers on the sphere.
//
// The cos(lat) weight is not optional. Equirectangular cells shrink toward the poles while the mask holds one bit each, so a flat
// probability puts as many particles across a degree of Siberia as across a degree of the equator and the Arctic comes out as a
// solid cap. Weighting by real area is what makes the field even on the sphere rather than even on the map.
const landCells = () => {
  const cells = [];
  let total = 0;
  for (let row = 0; row < LAND.height; row += 1) {
    const weight = Math.cos((90 - (row + 0.5) * CELL_LAT) * DEG);
    for (let col = 0; col < LAND.width; col += 1) {
      if (!isLand(row * LAND.width + col)) continue;
      cells.push(row, col, weight);
      total += weight;
    }
  }
  return { cells, total };
};

// A jittered point inside one cell. At full jitter a particle can cross into its neighbour, which is what softens the coastlines
// into something hand-placed rather than a staircase off a 0.7-degree grid.
const inCell = (cells, entry, random, jitter) => {
  const row = cells[entry],
    col = cells[entry + 1];
  return [-180 + (col + 0.5 + (random() - 0.5) * jitter) * CELL_LON, 90 - (row + 0.5 + (random() - 0.5) * jitter) * CELL_LAT];
};

// Exactly `count` points, because the caller's buffer is exactly that long and a pose that fills part of it leaves the rest of the
// mark parked at the origin as a bright knot.
//
// One weighted pass gets close and then the tail is filled by drawing cells at random. Trying to hit the count by tuning the
// probability instead is a loop that either overshoots or runs the whole mask again, and neither is worth the accuracy.
export function buildGlobePose(count, random, jitter) {
  const { cells, total } = landCells();
  const share = count / total;
  const picked = [];
  for (let entry = 0; entry < cells.length && picked.length < count * 2; entry += 3) {
    if (random() > share * cells[entry + 2]) continue;
    picked.push(inCell(cells, entry, random, jitter));
  }
  while (picked.length < count) {
    picked.push(inCell(cells, Math.floor(random() * (cells.length / 3)) * 3, random, jitter));
  }
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) onSphere(picked[index][0], picked[index][1], 1, positions, index * 3);
  // Sorted by bearing like every other pose, so index i means the same direction in the cloud, the letterform and the globe. Without
  // it a morph between any two of them is every particle taking its own straight line and the field crossing itself in every
  // direction at once — see lib/shape/order.
  return sortByAngle(positions);
}
