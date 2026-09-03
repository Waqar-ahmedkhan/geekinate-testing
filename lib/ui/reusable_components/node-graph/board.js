import { NODE_GRAPH } from '@/constants';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SETTLED = 0.01;
const ASSEMBLED_AT = Math.max(
  NODE_GRAPH.assembleLead + (NODE_GRAPH.nodes.length - 1) * NODE_GRAPH.assembleStagger + NODE_GRAPH.assembleSpan,
  NODE_GRAPH.traceLead + (NODE_GRAPH.edges.length - 1) * NODE_GRAPH.traceStagger + NODE_GRAPH.traceSpan
);
const clamp01 = (value) => Math.max(0, Math.min(1, value));

export const easeOut = (value) => 1 - Math.pow(1 - clamp01(value), 3);

const laneOffsets = () => {
  const outCount = {},
    inCount = {},
    outSeen = {},
    inSeen = {};
  NODE_GRAPH.edges.forEach(([from, to]) => {
    outCount[from] = (outCount[from] || 0) + 1;
    inCount[to] = (inCount[to] || 0) + 1;
  });
  return NODE_GRAPH.edges.map(([from, to]) => {
    const out = outSeen[from] || 0,
      into = inSeen[to] || 0;
    outSeen[from] = out + 1;
    inSeen[to] = into + 1;
    return [(out - (outCount[from] - 1) / 2) * NODE_GRAPH.fanSpread, (into - (inCount[to] - 1) / 2) * NODE_GRAPH.fanSpread];
  });
};

const elbowPath = (from, to, fromLane, toLane) => {
  const headX = from.x + fromLane,
    footX = to.x + toLane;
  const headY = from.y + from.size / 2,
    footY = to.y - to.size / 2;
  if (Math.abs(headX - footX) < 3) {
    const straight = (headX + footX) / 2;
    return `M ${straight} ${headY} L ${straight} ${footY}`;
  }
  const midY = (headY + footY) / 2;
  const radius = Math.min(NODE_GRAPH.elbowRadius, Math.abs(headX - footX) / 2, Math.abs(footY - headY) / 2);
  const turn = footX > headX ? 1 : -1;
  return [
    `M ${headX} ${headY}`,
    `L ${headX} ${midY - radius}`,
    `Q ${headX} ${midY} ${headX + turn * radius} ${midY}`,
    `L ${footX - turn * radius} ${midY}`,
    `Q ${footX} ${midY} ${footX} ${midY + radius}`,
    `L ${footX} ${footY}`,
  ].join(' ');
};

const samplePath = (path) => {
  const step = NODE_GRAPH.sampleStep;
  const length = path.getTotalLength();
  const count = Math.ceil(length / step) + 1;
  const xs = new Float32Array(count),
    ys = new Float32Array(count);
  for (let at = 0; at < count; at++) {
    const point = path.getPointAtLength(Math.min(at * step, length));
    xs[at] = point.x;
    ys[at] = point.y;
  }
  return { xs, ys, length, step, count };
};

const pickEdges = (edges) => {
  if (edges.length < 2) return edges;
  const order = edges.map((edge) => ({ edge, roll: Math.random() })).sort((first, second) => first.roll - second.roll);
  const width = Math.random() < NODE_GRAPH.branchChance ? 2 : 1;
  return order.slice(0, width).map((entry) => entry.edge);
};

const fireModule = (board, index) => {
  const unit = board.modules[index];
  unit.glow = 1;
  unit.ring = 1;
  if (unit.cooldown > 0) return;
  unit.cooldown = NODE_GRAPH.nodeCooldown;
  pickEdges(board.outgoing[index]).forEach((edge, at) => {
    board.pending.push({ edge, due: board.clock + NODE_GRAPH.nodeDelay + at * NODE_GRAPH.branchLag });
  });
};

export const buildBoard = (svg) => {
  const lanes = laneOffsets();
  const edges = NODE_GRAPH.edges.map(([from, to], at) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', elbowPath(NODE_GRAPH.nodes[from], NODE_GRAPH.nodes[to], lanes[at][0], lanes[at][1]));
    svg.appendChild(path);
    return { from, to, geometry: samplePath(path), heat: 0, drawn: 0 };
  });
  const outgoing = NODE_GRAPH.nodes.map((_, index) => edges.map((edge, at) => (edge.from === index ? at : -1)).filter((at) => at >= 0));
  const modules = NODE_GRAPH.nodes.map(() => ({ glow: 0, ring: 0, cooldown: 0, appear: 0 }));
  return { edges, outgoing, modules, pulses: [], pending: [], clock: 0, sinceRun: NODE_GRAPH.runEvery, runIndex: 0, live: false };
};

const pickSource = (board) => {
  const rotated = NODE_GRAPH.sources.map((_, offset) => NODE_GRAPH.sources[(board.runIndex + offset) % NODE_GRAPH.sources.length]);
  return rotated.find((index) => board.modules[index].cooldown <= 0) ?? rotated[0];
};

export const wakeBoard = (board) => {
  board.live = true;
  if (!board.pulses.length && !board.pending.length) board.sinceRun = NODE_GRAPH.runEvery;
};

const startRun = (board) => {
  board.sinceRun -= NODE_GRAPH.runEvery;
  const source = pickSource(board);
  board.runIndex++;
  fireModule(board, source);
  if (board.runIndex % NODE_GRAPH.mergeEvery) return;
  const partner = NODE_GRAPH.sources[board.runIndex % NODE_GRAPH.sources.length];
  board.pending.push({ unit: partner, due: board.clock + NODE_GRAPH.mergeLag });
};

export const stepBoard = (board, delta) => {
  board.clock += delta;
  board.modules.forEach((unit, index) => {
    const lead = NODE_GRAPH.assembleLead + index * NODE_GRAPH.assembleStagger;
    unit.appear = Math.max(unit.appear, clamp01((board.clock - lead) / NODE_GRAPH.assembleSpan));
  });
  board.edges.forEach((edge, index) => {
    const lead = NODE_GRAPH.traceLead + index * NODE_GRAPH.traceStagger;
    edge.drawn = Math.max(edge.drawn, clamp01((board.clock - lead) / NODE_GRAPH.traceSpan));
  });
  if (board.live && board.clock > NODE_GRAPH.settleAt) {
    board.sinceRun += delta;
    if (board.sinceRun >= NODE_GRAPH.runEvery) startRun(board);
  }
  for (let at = board.pending.length - 1; at >= 0; at--) {
    const waiting = board.pending[at];
    if (waiting.due > board.clock) continue;
    board.pending.splice(at, 1);
    if (waiting.unit === undefined) board.pulses.push({ edge: waiting.edge, travelled: 0 });
    else fireModule(board, waiting.unit);
  }
  for (let at = board.pulses.length - 1; at >= 0; at--) {
    const pulse = board.pulses[at];
    const edge = board.edges[pulse.edge];
    pulse.travelled += NODE_GRAPH.pulseSpeed * delta;
    edge.heat = Math.min(1, edge.heat + delta * NODE_GRAPH.heatRise);
    if (pulse.travelled < edge.geometry.length) continue;
    board.pulses.splice(at, 1);
    fireModule(board, edge.to);
  }
  board.edges.forEach((edge) => {
    edge.heat *= Math.exp(-delta * NODE_GRAPH.heatFall);
  });
  board.modules.forEach((unit) => {
    unit.glow *= Math.exp(-delta * NODE_GRAPH.glowFall);
    unit.ring *= Math.exp(-delta * NODE_GRAPH.ringFall);
    unit.cooldown = Math.max(0, unit.cooldown - delta);
  });
  const output = board.modules[NODE_GRAPH.output];
  if (board.live)
    output.glow = Math.max(output.glow, NODE_GRAPH.idleGlow + NODE_GRAPH.idleSwing * Math.sin(board.clock * NODE_GRAPH.idleRate));
  if (board.live || board.pulses.length || board.pending.length || board.clock < ASSEMBLED_AT) return true;
  return board.modules.some((unit) => unit.glow > SETTLED) || board.edges.some((edge) => edge.heat > SETTLED);
};

export const primeBoard = (board) => {
  for (let frame = 0; frame < NODE_GRAPH.primeFrames; frame++) stepBoard(board, 1 / 60);
  board.pulses.length = 0;
};
