import { sortByAngle } from './order';

const TAU = Math.PI * 2;

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

const disc = (cx, cy, radius) => ({ at: () => [cx, cy], width: radius * 2, weight: Math.PI * radius * radius });

const box = (left, bottom, right, top, width) => [
  segment(left, bottom, right, bottom, width),
  segment(right, bottom, right, top, width),
  segment(right, top, left, top, width),
  segment(left, top, left, bottom, width),
];

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
    const angle = Math.random() * TAU,
      spread = (chosen.width / 2) * Math.sqrt(Math.random());
    positions[i * 3] = (x + Math.cos(angle) * spread) * radius;
    positions[i * 3 + 1] = (y + Math.sin(angle) * spread) * radius;
    positions[i * 3 + 2] = (Math.random() + Math.random() + Math.random() - 1.5) * depth;
  }
  return sortByAngle(positions);
};

export function samplePillars(count, { radius, depth }) {
  return [network(), cross(), chart(), browser()].map((primitives) => samplePrimitives(primitives, count, radius, depth));
}
