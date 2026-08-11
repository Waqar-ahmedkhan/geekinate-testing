// Bakes the Geekinate mark's centreline into lib/curve/g-points.json. Run with `node scripts/sample-g-path.mjs`.
//
// public/brand/geekinate-mark.svg is a FILLED OUTLINE, not a stroke. Sampling its path traces the edge of the letter and yields a
// tube that runs around the glyph instead of through it. The outline does carry a dead-uniform 260-unit stroke width — measured at
// 100->360, 1038->1298, and both end caps — so the centreline is exact arithmetic rather than a trace, and no tracing library is
// needed. It is five straight runs joined by four quarter-arcs of radius 235, in the glyph's own y-up coordinate space:
//
//   (464,-339) --> c(933,-104) --> c(933,717) --> c(465,717) --> c(465,365) --> (933,130)
//
// That reads as an open spiral of roughly one and a half turns with two free ends: the tail at the bottom spur, the head at the bar
// tip inside the bowl. Being open, the letterform has no seam — Region A of the master spine needs no gap to hide one.
//
// Corner centres are rounded to a single radius. The source outline is internally inconsistent by up to one unit (364 vs 365 on
// facing corners), which is font rounding, not geometry; one shared radius keeps every straight run collinear with its neighbours.

import { writeFileSync } from 'node:fs';

const RADIUS = 235,
  SAMPLES = 256,
  PRECISION = 5;
const TAIL = [464, -339],
  HEAD = [933, 130];
const CORNERS = [
  { centre: [933, -104], from: -90, to: 0 },
  { centre: [933, 717], from: 0, to: 90 },
  { centre: [465, 717], from: 90, to: 180 },
  { centre: [465, 365], from: 180, to: 270 },
];
const OUTPUT = new URL('../lib/curve/g-points.json', import.meta.url);
const toRadians = (degrees) => (degrees * Math.PI) / 180;
const round = (value) => Number(value.toFixed(PRECISION));
const distance = ([ax, ay], [bx, by]) => Math.hypot(bx - ax, by - ay);
const lerp = ([ax, ay], [bx, by], t) => [ax + (bx - ax) * t, ay + (by - ay) * t];
const arcPoint = ([cx, cy], degrees) => [cx + RADIUS * Math.cos(toRadians(degrees)), cy + RADIUS * Math.sin(toRadians(degrees))];

// Each corner contributes the straight run that reaches it plus its own sweep; the bar is the one run with no corner after it.
const buildSpine = () => {
  const walked = CORNERS.reduce(
    ({ segments, cursor }, { centre, from, to }) => {
      const entry = arcPoint(centre, from);
      const run = { length: distance(cursor, entry), at: (t) => lerp(cursor, entry, t) };
      const sweep = { length: RADIUS * toRadians(Math.abs(to - from)), at: (t) => arcPoint(centre, from + (to - from) * t) };
      return { segments: [...segments, run, sweep], cursor: arcPoint(centre, to) };
    },
    { segments: [], cursor: TAIL }
  );
  const bar = { length: distance(walked.cursor, HEAD), at: (t) => lerp(walked.cursor, HEAD, t) };
  return [...walked.segments, bar];
};

// Uniform by arc length, not by segment, or the corners would carry the same point count as the long straights and bunch up.
const pointAtLength = (segments, target) => {
  const walked = segments.reduce(
    (state, segment) =>
      state.point || state.travelled > segment.length
        ? { travelled: state.travelled - segment.length, point: state.point }
        : { travelled: 0, point: segment.at(segment.length ? state.travelled / segment.length : 0) },
    { travelled: target, point: null }
  );
  return walked.point || segments[segments.length - 1].at(1);
};

// Centred on the letterform's own bounding box and divided by its longer side, so the mark lands in a unit box around the origin.
const normalise = (points, arcLength) => {
  const xs = points.map(([x]) => x),
    ys = points.map(([, y]) => y);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const centreX = (minX + maxX) / 2,
    centreY = (minY + maxY) / 2;
  const scale = Math.max(maxX - minX, maxY - minY);
  return {
    scale,
    arcLength: round(arcLength / scale),
    bounds: { width: round((maxX - minX) / scale), height: round((maxY - minY) / scale) },
    points: points.map(([x, y]) => [round((x - centreX) / scale), round((y - centreY) / scale)]),
  };
};

const spine = buildSpine();
const totalLength = spine.reduce((sum, { length }) => sum + length, 0);
const sampled = Array.from({ length: SAMPLES }, (_, index) => pointAtLength(spine, (totalLength * index) / (SAMPLES - 1)));
const { scale, arcLength, bounds, points } = normalise(sampled, totalLength);
const payload = {
  source: 'public/brand/geekinate-mark.svg',
  generator: 'scripts/sample-g-path.mjs',
  note: 'Generated. Do not edit by hand — re-run the generator instead.',
  sampleCount: SAMPLES,
  glyphArcLength: round(totalLength),
  glyphScale: scale,
  arcLength,
  bounds,
  points,
};

writeFileSync(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
process.stdout.write(`Baked ${SAMPLES} points, normalised arc length ${arcLength}, to lib/curve/g-points.json\n`);
