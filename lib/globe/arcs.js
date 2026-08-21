import { dot3, gap2, slerp } from './sphere';
import { GLOBE } from '@/constants';

const pickAnchors = (positions, count, random) => {
  const anchors = [];
  const spacing2 = GLOBE.anchorSpacing * GLOBE.anchorSpacing;
  const attempts = GLOBE.anchorCount * 60;
  for (let attempt = 0; attempt < attempts && anchors.length < GLOBE.anchorCount; attempt += 1) {
    const at = Math.floor(random() * count) * 3;
    const point = [positions[at], positions[at + 1], positions[at + 2]];
    if (anchors.some(({ point: taken }) => gap2(taken, 0, point, 0) < spacing2)) continue;
    anchors.push({ point, index: anchors.length, group: anchors.length % GLOBE.groups });
  }
  return anchors;
};

const pickRoute = (anchors, random) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const from = anchors[Math.floor(random() * anchors.length)],
      to = anchors[Math.floor(random() * anchors.length)];
    const angle = Math.acos(Math.min(1, Math.max(-1, dot3(from.point, 0, to.point, 0))));
    if (angle < GLOBE.arcSpan[0] || angle > GLOBE.arcSpan[1]) continue;
    return { from, to, angle };
  }
  return null;
};

const buildArcs = (anchors, random) => {
  const byGroup = Array.from({ length: GLOBE.groups }, (unused, group) => anchors.filter((anchor) => anchor.group === group));
  const routes = Array.from({ length: GLOBE.arcCount }, (unused, index) => {
    const pool = index % 2 === 0 ? byGroup[index % GLOBE.groups] : anchors;
    return pool.length > 1 ? pickRoute(pool, random) : null;
  }).filter(Boolean);
  const perArc = GLOBE.arcSegments * 2;
  const positions = new Float32Array(routes.length * perArc * 3);
  const along = new Float32Array(routes.length * perArc);
  const seed = new Float32Array(routes.length * perArc);
  const ends = new Float32Array(routes.length * perArc * 2);
  const group = new Float32Array(routes.length * perArc);
  const point = new Float32Array(3);
  routes.forEach(({ from, to, angle }, index) => {
    const phase = random();
    const height = GLOBE.arcLift * (0.3 + angle / Math.PI);
    for (let step = 0; step < GLOBE.arcSegments; step += 1) {
      [step / GLOBE.arcSegments, (step + 1) / GLOBE.arcSegments].forEach((t, end) => {
        const vertex = index * perArc + step * 2 + end;
        slerp(from.point, to.point, angle, t, 1 + Math.sin(Math.PI * t) * height, point);
        positions.set(point, vertex * 3);
        along[vertex] = t;
        seed[vertex] = phase;
        ends[vertex * 2] = from.index;
        ends[vertex * 2 + 1] = to.index;
        group[vertex] = from.group;
      });
    }
  });
  return { positions, along, seed, ends, group, count: routes.length * perArc };
};

const buildFlares = (anchors, positions, dots, random) => {
  const count = anchors.length + GLOBE.flareExtra;
  const points = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  const anchor = new Float32Array(count);
  const group = new Float32Array(count);
  anchors.forEach(({ point, index, group: pillar }) => {
    for (let axis = 0; axis < 3; axis += 1) points[index * 3 + axis] = point[axis] * GLOBE.flareRadius;
    anchor[index] = index;
    group[index] = pillar;
  });
  for (let extra = 0; extra < GLOBE.flareExtra; extra += 1) {
    const index = anchors.length + extra,
      at = Math.floor(random() * dots) * 3;
    for (let axis = 0; axis < 3; axis += 1) points[index * 3 + axis] = positions[at + axis] * GLOBE.flareRadius;
    anchor[index] = -1;
    group[index] = -1;
  }
  for (let index = 0; index < count; index += 1) {
    phase[index] = random();
    speed[index] = (0.6 + random() * 0.8) / GLOBE.flarePeriod;
  }
  return { positions: points, phase, speed, anchor, group, count };
};

export const buildNetwork = (positions, dots, random) => {
  const anchors = pickAnchors(positions, dots, random);
  return { anchors, arcs: buildArcs(anchors, random), flares: buildFlares(anchors, positions, dots, random) };
};
