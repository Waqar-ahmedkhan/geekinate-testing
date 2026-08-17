import { sortByAngle } from './order';

// The four service pillars, as particle diagrams the cloud walks through across the middle of the page: a network, a control cross,
// a rising chart, a browser frame. They replaced a snake, which is worth recording because the snake was not badly built — it was a
// straight rod bent by one travelling sine, and that is exactly the problem. One sine of constant amplitude and constant wavelength
// along a whole body is what water looks like; an animal's gait grows from head to tail. Rather than fake a better gait, the middle
// of the page now says what the agency sells.
//
// Drawn parametrically rather than rasterised from assets. The letterform comes off the brand SVG because it is a brand asset with
// one correct shape; these are diagrams, and a handful of segments and discs is both smaller than four more SVGs and the only
// version that can be nudged without opening a drawing tool.
//
// Every shape is authored in a roughly [-1, 1] box and scaled on the way out, so they arrive at matching visual weight without four
// separate sets of coordinates to keep in step.
const TAU = Math.PI * 2;

// `weight` is the area a primitive covers, and distributing a fixed particle budget between primitives has to go by area rather than
// by length — sample by length alone and a thick bar comes out as sparse as a hairline next to it.
const stroke = (at, length, width) => ({ at, width, weight: length * width });

const segment = (ax, ay, bx, by, width) => stroke((t) => [ax + (bx - ax) * t, ay + (by - ay) * t], Math.hypot(bx - ax, by - ay), width);

const arc = (cx, cy, radius, from, to, width) =>
  stroke(
    (t) => {
      const angle = from + (to - from) * t;
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    },
    Math.abs(to - from) * radius,
    width
  );

// A filled dot. Its `at` ignores t and the jitter does all the work, which is what makes it a disc rather than a point.
const disc = (cx, cy, radius) => ({ at: () => [cx, cy], width: radius * 2, weight: Math.PI * radius * radius });

const box = (left, bottom, right, top, width) => [
  segment(left, bottom, right, bottom, width),
  segment(right, bottom, right, top, width),
  segment(right, top, left, top, width),
  segment(left, top, left, bottom, width),
];

// Layered network: three columns of nodes, every node wired to every node in the next column.
const network = () => {
  const columns = [
    { x: -0.85, rows: [-0.6, 0, 0.6] },
    { x: 0, rows: [-0.72, -0.24, 0.24, 0.72] },
    { x: 0.85, rows: [-0.3, 0.3] },
  ];
  const edges = columns
    .slice(0, -1)
    .flatMap((column, index) =>
      column.rows.flatMap((from) => columns[index + 1].rows.map((to) => segment(column.x, from, columns[index + 1].x, to, 0.02)))
    );
  return [...edges, ...columns.flatMap(({ x, rows }) => rows.map((y) => disc(x, y, 0.1)))];
};

// The control cross, walked as one outline. Written as offsets from the arm half-width and half-length so the proportions can be
// changed by two numbers rather than by twelve corners.
const cross = () => {
  const arm = 0.26,
    reach = 0.85;
  const corners = [
    [arm, arm],
    [arm, reach],
    [-arm, reach],
    [-arm, arm],
    [-reach, arm],
    [-reach, -arm],
    [-arm, -arm],
    [-arm, -reach],
    [arm, -reach],
    [arm, -arm],
    [reach, -arm],
    [reach, arm],
  ];
  const outline = corners.map(([x, y], index) => {
    const [nextX, nextY] = corners[(index + 1) % corners.length];
    return segment(x, y, nextX, nextY, 0.05);
  });
  return [...outline, disc(0, 0, 0.14)];
};

// Rising bars on a baseline, with a trend line over them.
const chart = () => {
  const base = -0.8;
  const bars = [0.45, 0.75, 1.05, 1.4].flatMap((height, index) => {
    const centre = -0.6 + index * 0.4;
    return box(centre - 0.13, base, centre + 0.13, base + height, 0.045);
  });
  return [
    segment(-0.9, base, 0.9, base, 0.04),
    ...bars,
    segment(-0.75, -0.15, 0.75, 0.8, 0.04),
    segment(0.75, 0.8, 0.42, 0.76, 0.04),
    segment(0.75, 0.8, 0.7, 0.47, 0.04),
  ];
};

// Browser frame: a rounded rectangle, a title rule, its three dots and two lines of stand-in content.
const browser = () => {
  const right = 0.95,
    top = 0.7,
    radius = 0.16,
    width = 0.045;
  const quarter = TAU / 4;
  return [
    segment(-right + radius, -top, right - radius, -top, width),
    segment(right, -top + radius, right, top - radius, width),
    segment(right - radius, top, -right + radius, top, width),
    segment(-right, top - radius, -right, -top + radius, width),
    arc(right - radius, -top + radius, radius, -quarter, 0, width),
    arc(right - radius, top - radius, radius, 0, quarter, width),
    arc(-right + radius, top - radius, radius, quarter, 2 * quarter, width),
    arc(-right + radius, -top + radius, radius, 2 * quarter, 3 * quarter, width),
    segment(-right, 0.34, right, 0.34, width),
    disc(-0.76, 0.52, 0.055),
    disc(-0.58, 0.52, 0.055),
    disc(-0.4, 0.52, 0.055),
    segment(-0.68, 0.02, 0.5, 0.02, 0.05),
    segment(-0.68, -0.3, 0.14, -0.3, 0.05),
  ];
};

const samplePrimitives = (primitives, count, radius, depth) => {
  const total = primitives.reduce((sum, { weight }) => sum + weight, 0);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    let roll = Math.random() * total,
      chosen = primitives[primitives.length - 1];
    for (let index = 0; index < primitives.length; index += 1) {
      roll -= primitives[index].weight;
      if (roll <= 0) {
        chosen = primitives[index];
        break;
      }
    }
    const [x, y] = chosen.at(Math.random());
    // Jittered inside a disc of the primitive's own width rather than across a square, so a dot stays round and a stroke keeps a
    // soft edge instead of a rectangular one.
    const angle = Math.random() * TAU,
      spread = (chosen.width / 2) * Math.sqrt(Math.random());
    positions[i * 3] = (x + Math.cos(angle) * spread) * radius;
    positions[i * 3 + 1] = (y + Math.sin(angle) * spread) * radius;
    positions[i * 3 + 2] = (Math.random() + Math.random() + Math.random() - 1.5) * depth;
  }
  // Sorted by bearing, like every other pose. Index i then means the same direction in all six shapes, which is what stops a morph
  // reading as every particle taking its own straight line across the frame.
  return sortByAngle(positions);
};

export function samplePillars(count, { radius, depth }) {
  return [network(), cross(), chart(), browser()].map((primitives) => samplePrimitives(primitives, count, radius, depth));
}
