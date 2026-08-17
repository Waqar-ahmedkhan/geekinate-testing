// The network layer: the anchors routes run between, the great-circle arcs themselves, and the star flares that fire on them.
//
// One anchor set feeds all three, and that is the whole reason the reference reads as a network rather than as a map with
// decoration on it — every flare sits where arcs meet, so a flare firing looks like that junction firing.
//
// Anchors also carry two labels that only exist for the interactions. `index` is the anchor's own slot, so the frame loop can point
// at the one nearest the cursor and have the shaders light it without a buffer upload. `group` is which of the four service pillars
// it belongs to, so hovering a pillar in the hero lights its own share of the network. Both ride as vertex attributes because the
// alternative is rewriting geometry every frame for what is a comparison against a uniform.
import { dot3, gap2, slerp } from './sphere';
import { GLOBE } from '@/constants';

// Anchors, spaced. Picking them at random puts several inside the same city and leaves whole coastlines empty; rejecting any
// candidate within `anchorSpacing` of one already taken spreads them without needing a relaxation pass.
//
// Bounded rather than looped until full: a spacing that cannot be satisfied on the available land would otherwise spin here
// forever, and coming up a few anchors short is invisible where hanging is not.
const pickAnchors = (positions, count, random) => {
  const anchors = [];
  const spacing2 = GLOBE.anchorSpacing * GLOBE.anchorSpacing;
  const attempts = GLOBE.anchorCount * 60;
  for (let attempt = 0; attempt < attempts && anchors.length < GLOBE.anchorCount; attempt += 1) {
    const at = Math.floor(random() * count) * 3;
    const point = [positions[at], positions[at + 1], positions[at + 2]];
    if (anchors.some(({ point: taken }) => gap2(taken, 0, point, 0) < spacing2)) continue;
    // Round-robin rather than random. Four pillars over fifty-odd anchors is small enough that a random assignment leaves one
    // pillar with a third of the globe and another with four points on the same continent.
    anchors.push({ point, index: anchors.length, group: anchors.length % GLOBE.groups });
  }
  return anchors;
};

// A route between two anchors far enough apart to be worth drawing. The span keeps the set legible: below the floor an arc is a
// smudge on the surface, above the ceiling it wraps most of the way round the globe and spends half its length behind it.
//
// `within` restricts both ends to one pillar's anchors, which is what makes a pillar hover light a network rather than a scatter.
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

// Every arc into one geometry, as line segments. One draw call for the whole network, and everything animate rides on `seed` and
// the two labels rather than on anything the CPU touches per frame.
//
// The lift is scaled by the arc's own angle as well as by `arcLift`. A short hop and a hemisphere-long route lifted by the same
// amount read as two unrelated things; tying height to distance is what makes them read as the same kind of route at two lengths.
const buildArcs = (anchors, random) => {
  const byGroup = Array.from({ length: GLOBE.groups }, (unused, group) => anchors.filter((anchor) => anchor.group === group));
  // Half the routes are drawn inside a single pillar and half across the whole set, so the network reads as one system that also
  // happens to be divisible — all-within reads as four separate diagrams, all-across leaves a pillar hover with nothing to light.
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
      // Each segment is emitted as its own pair of ends rather than as a strip, because LineSegments is the primitive that lets the
      // whole network share one buffer without the last point of one arc joining the first point of the next.
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

// The flares. Anchors first, so every junction can fire, then extras scattered over the field so the map itself sparkles — the
// reference has both, and only the junctions would read as a diagram rather than as a lit globe.
//
// `speed` is a fraction of a full cycle per second and every flare gets its own, on top of its own phase. Shared periods are what
// make a field of blinking points read as a pattern; two randoms per flare is enough that no two ever line up for long. The extras
// take anchor index -1, so nothing the cursor or a pillar points at can ever land on one.
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
