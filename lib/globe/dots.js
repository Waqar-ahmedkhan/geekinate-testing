import { LAND } from './land';
import { onSphere } from './sphere';
import { sortByAngle } from '@/lib/shape/order';

const CELL_LON = 360 / LAND.width;
const CELL_LAT = 180 / LAND.height;
const DEG = Math.PI / 180;

let bytes = null;

const unpack = () => {
  if (bytes) return bytes;
  const binary = atob(LAND.bits);
  bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return bytes;
};

const isLand = (index) => (unpack()[index >> 3] >> (index & 7)) & 1;

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

const inCell = (cells, entry, random, jitter) => {
  const row = cells[entry],
    col = cells[entry + 1];
  return [-180 + (col + 0.5 + (random() - 0.5) * jitter) * CELL_LON, 90 - (row + 0.5 + (random() - 0.5) * jitter) * CELL_LAT];
};

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
  return sortByAngle(positions);
}
