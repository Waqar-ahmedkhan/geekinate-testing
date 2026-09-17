import { angleOrder } from './order';
import { CIRCUIT } from '@/constants';

const TAU = Math.PI * 2;
const KIND = { trace: 1, pad: 2, ring: 3, letter: 4 };

const random = Math.random;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, factor) => [a[0] * factor, a[1] * factor, a[2] * factor];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const norm = (vector) => {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return scale(vector, 1 / length);
};
const randomDir = () => {
  const lean = random() * 2 - 1,
    angle = random() * TAU,
    spread = Math.sqrt(1 - lean * lean);
  return [spread * Math.cos(angle), spread * Math.sin(angle), lean];
};

const prim = (weight, draw) => ({ weight, draw });

const path = (at, length, width, data) =>
  prim(length * width, () => {
    const t = random();
    const offset = scale(randomDir(), (width / 2) * Math.sqrt(random()));
    return { point: add(at(t), offset), normal: norm(offset), data: data(t) };
  });

const tube = (from, to, width, data) => path((t) => lerp(from, to, t), Math.hypot(to[0] - from[0], to[1] - from[1]), width, data);

const ring = ([x, y, z], radius, width, data) =>
  path((t) => [x + Math.cos(t * TAU) * radius, y + Math.sin(t * TAU) * radius, z], TAU * radius, width, data);

const disc = ([x, y, z], radius, data) =>
  prim(Math.PI * radius * radius * 2, () => {
    const angle = random() * TAU,
      reach = Math.sqrt(random()) * radius;
    return { point: [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, z], normal: [0, 0, 1], data: data() };
  });

const bar = (from, to, data) => {
  const { stroke, depth, lift } = CIRCUIT;
  return prim(Math.hypot(to[0] - from[0], to[1] - from[1]) * stroke + stroke * stroke, () => {
    const t = random(),
      dir = randomDir(),
      reach = Math.pow(random(), 0.3);
    const point = [
      from[0] + (to[0] - from[0]) * t + dir[0] * (stroke / 2) * reach,
      from[1] + (to[1] - from[1]) * t + dir[1] * (stroke / 2) * reach,
      lift + dir[2] * (depth / 2) * reach,
    ];
    return { point, normal: norm([dir[0], dir[1], dir[2] + 0.6]), data: data(point) };
  });
};

const share = (prims, portion) => {
  const total = prims.reduce((sum, { weight }) => sum + weight, 0);
  return prims.map((item) => ({ ...item, weight: (item.weight / total) * portion }));
};

const clipToCircle = (points, radius) =>
  points.reduce(
    (state, point, index) => {
      if (state.done || index === 0) return state;
      const [ax, ay] = points[index - 1];
      if (Math.hypot(point[0], point[1]) <= radius) return { done: false, kept: [...state.kept, point] };
      const dx = point[0] - ax,
        dy = point[1] - ay;
      const a = dx * dx + dy * dy,
        b = 2 * (ax * dx + ay * dy),
        c = ax * ax + ay * ay - radius * radius;
      const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a);
      return { done: true, kept: [...state.kept, [ax + dx * t, ay + dy * t]] };
    },
    { done: false, kept: [points[0]] }
  ).kept;

const offsetPolyline = (points, distance) => {
  const normals = points.slice(1).map(([bx, by], index) => {
    const [ax, ay] = points[index];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    return [-(by - ay) / length, (bx - ax) / length];
  });
  return points.map(([x, y], index) => {
    const before = normals[Math.max(0, index - 1)],
      after = normals[Math.min(normals.length - 1, index)];
    const length = Math.hypot(before[0] + after[0], before[1] + after[1]) || 1;
    const mx = (before[0] + after[0]) / length,
      my = (before[1] + after[1]) / length;
    const stretch = distance / (mx * after[0] + my * after[1]);
    return [x + mx * stretch, y + my * stretch];
  });
};

const bus = (centre, count, shift = (line) => line) =>
  Array.from({ length: count }, (unused, index) => shift(offsetPolyline(centre, (index - (count - 1) / 2) * CIRCUIT.trace.gap)));

const trace = (points) => {
  const { width, reach, via, pin } = CIRCUIT.trace;
  const seed = random();
  const route = clipToCircle(points, reach).reverse();
  const [ox, oy] = route[0],
    [nx, ny] = route[1];
  const lead = Math.hypot(nx - ox, ny - oy) || 1;
  const drawn = [[ox + ((nx - ox) / lead) * via, oy + ((ny - oy) / lead) * via], ...route.slice(1)];
  const lengths = drawn.slice(1).map((point, index) => Math.hypot(point[0] - drawn[index][0], point[1] - drawn[index][1]));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  const starts = lengths.map((unused, index) => lengths.slice(0, index).reduce((sum, value) => sum + value, 0) / total);
  const segments = lengths.map((length, index) => {
    const [ax, ay] = drawn[index],
      [bx, by] = drawn[index + 1];
    return tube([ax, ay, 0], [bx, by, 0], width, (t) => [KIND.trace, starts[index] + (t * length) / total, seed, 0]);
  });
  const [ix, iy] = route[route.length - 1];
  const pads = [ring([ox, oy, 0], via, width * 1.6, () => [KIND.pad, 0, seed, 0]), disc([ix, iy, 0], pin, () => [KIND.pad, 1, seed, 0])];
  return { segments, pads };
};

const leftLegX = (y) => -0.169 - ((0.576 - y) / 0.843) * 0.568;

const routes = () => {
  const arch = Array.from({ length: 12 }, (unused, index) => Math.PI - (index / 11) * Math.PI);
  return [
    ...bus(
      [
        [-0.5, 0.52],
        [-0.72, 0.74],
        [-0.72, 1.3],
      ],
      5
    ),
    ...bus(
      [
        [-0.62, 0.12],
        [-0.9, 0.12],
        [-1.3, -0.28],
      ],
      5,
      (line) => [[leftLegX(line[0][1]) - 0.17, line[0][1]], ...line.slice(1)]
    ),
    ...bus(
      [
        [-0.335, -0.42],
        [-0.335, -0.62],
        [-0.535, -0.82],
        [-0.535, -1.3],
      ],
      6
    ),
    ...bus(
      [
        [0.42, -0.6],
        [0.6, -0.78],
        [0.6, -1.3],
      ],
      4
    ),
    ...bus(
      [
        [0.08, 0.62],
        [0.08, 0.8],
        [0.28, 1.0],
        [0.28, 1.3],
      ],
      4
    ),
    ...[0.42, 0.335, 0.25, 0.165, 0.08, -0.005, -0.09, -0.175, -0.26].map((y) => [
      [0.8, y],
      [0.94, y],
      [1.3, y + Math.sign(y - 0.08) * 0.36],
    ]),
    [[0.45, 0.1], [0.45, 0.62], ...arch.map((angle) => [0.62 + Math.cos(angle) * 0.17, 0.62 + Math.sin(angle) * 0.17]), [0.79, 0.46]],
  ].map(trace);
};

const primitives = () => {
  const { ring: ringRadius, orbit, shares } = CIRCUIT;
  const letterData = (point) => [KIND.letter, Math.min(1, Math.max(0, (point[1] + 0.45) / 1.05)), 0, random()];
  const letters = [
    bar([-0.169, 0.576], [-0.737, -0.267], letterData),
    bar([-0.737, -0.267], [-0.012, -0.267], letterData),
    bar([-0.169, 0.576], [0.243, -0.392], letterData),
    bar([0.608, 0.576], [0.608, -0.404], letterData),
  ];
  const circuit = routes();
  const rings = [
    ring([0, 0, -0.02], ringRadius, 0.012, () => [KIND.ring, 0, 0, random()]),
    ring([orbit.centre[0], orbit.centre[1], -0.02], orbit.radius, 0.012, () => [KIND.ring, 0, 0, random()]),
  ];
  return [
    ...share(letters, shares.letters),
    ...share(
      circuit.flatMap(({ segments }) => segments),
      shares.traces
    ),
    ...share(
      circuit.flatMap(({ pads }) => pads),
      shares.pads
    ),
    ...share(rings, shares.rings),
  ];
};

const drawSamples = (prims, count) => {
  const cumulative = prims.reduce((sums, { weight }) => [...sums, (sums[sums.length - 1] || 0) + weight], []);
  const total = cumulative[cumulative.length - 1];
  const pick = (roll) => {
    let low = 0,
      high = cumulative.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (cumulative[mid] < roll) low = mid + 1;
      else high = mid;
    }
    return low;
  };
  return Array.from({ length: count }, () => prims[pick(random() * total)].draw());
};

export function sampleCircuit(total) {
  const { members, memberCycle } = CIRCUIT;
  const slots = Array.from({ length: total }, (unused, index) => index).filter((index) => index % memberCycle < members);
  const samples = drawSamples(primitives(), slots.length);
  const order = angleOrder(Float32Array.from(samples.flatMap(({ point }) => point)));
  const positions = new Float32Array(total * 3),
    normals = new Float32Array(total * 3),
    data = new Float32Array(total * 4);
  order.forEach((from, to) => {
    const { point, normal, data: values } = samples[from];
    positions.set(point, slots[to] * 3);
    normals.set(normal, slots[to] * 3);
    data.set(values, slots[to] * 4);
  });
  return { positions, normals, data };
}
