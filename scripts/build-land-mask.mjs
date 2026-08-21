import { readFileSync, writeFileSync } from 'node:fs';

const WIDTH = 512;
const HEIGHT = 256;
const SOURCE = process.argv[2] || '.tmp/ne_110m_land.geojson';
const OUT = 'lib/globe/land.js';

const polygonsOf = ({ type, coordinates }) => (type === 'Polygon' ? [coordinates] : type === 'MultiPolygon' ? coordinates : []);

const crossings = (ring, lat) => {
  const hits = [];
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [ax, ay] = ring[index],
      [bx, by] = ring[index + 1];
    if (ay > lat === by > lat) continue;
    const lon = ax + ((lat - ay) / (by - ay)) * (bx - ax);
    hits.push(((lon + 180) / 360) * WIDTH);
  }
  return hits;
};

const geo = JSON.parse(readFileSync(SOURCE, 'utf8'));
const polygons = geo.features.flatMap((feature) => polygonsOf(feature.geometry));
const mask = new Uint8Array(WIDTH * HEIGHT);

for (let row = 0; row < HEIGHT; row += 1) {
  const lat = 90 - ((row + 0.5) / HEIGHT) * 180;
  polygons.forEach((rings) => {
    const hits = rings.flatMap((ring) => crossings(ring, lat)).sort((a, b) => a - b);
    for (let pair = 0; pair + 1 < hits.length; pair += 2) {
      const from = Math.max(0, Math.ceil(hits[pair] - 0.5)),
        to = Math.min(WIDTH - 1, Math.floor(hits[pair + 1] - 0.5));
      for (let col = from; col <= to; col += 1) mask[row * WIDTH + col] = 1;
    }
  });
}

const bytes = new Uint8Array((WIDTH * HEIGHT) / 8);
mask.forEach((lit, index) => {
  if (lit) bytes[index >> 3] |= 1 << (index & 7);
});

const land = mask.reduce((total, lit) => total + lit, 0);
const bits = Buffer.from(bytes).toString('base64');
const file = `export const LAND = {
  width: ${WIDTH},
  height: ${HEIGHT},
  bits: '${bits}',
};
`;

writeFileSync(OUT, file);
process.stdout.write(`${land} land cells of ${WIDTH * HEIGHT} (${((land / mask.length) * 100).toFixed(1)}%) -> ${OUT}\n\n`);

const STEP_X = WIDTH / 100,
  STEP_Y = HEIGHT / 40;
for (let row = 0; row < 40; row += 1) {
  let line = '';
  for (let col = 0; col < 100; col += 1) {
    line += mask[Math.floor(row * STEP_Y) * WIDTH + Math.floor(col * STEP_X)] ? '#' : ' ';
  }
  process.stdout.write(`${line}\n`);
}
