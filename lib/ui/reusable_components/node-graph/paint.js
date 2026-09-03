import { easeOut } from './board';
import { GLYPHS } from './glyphs';
import { NODE_GRAPH, NODE_GRAPH_PALETTE } from '@/constants';

const WEIGHT = {
  traceCase: 6.6,
  traceWell: 4.2,
  traceHeat: 7,
  traceCore: 2,
  pulseTrail: 2.4,
  pulseGlow: 14,
  pulseHead: 2.3,
  ringLine: 1.4,
  ringSpread: 30,
  ringRadius: 10,
  moduleEdge: 1,
  moduleRadius: 0.3,
  moduleLift: 1.1,
  indicatorRing: 0.72,
  glyphBox: 0.62,
  glyphStroke: 0.07,
  engineRing: 1.26,
  engineRingAlpha: 0.26,
  engineLift: 1.3,
  coreFloor: 0.38,
  coreHeat: 0.52,
  heatWash: 0.09,
  trailAlpha: 0.8,
  glowAlpha: 0.34,
  ringAlpha: 0.42,
  litFloor: 0.6,
  litGlow: 0.4,
  litWash: 0.28,
  sparkFloor: 0.3,
  sparkGain: 1.1,
  appearFloor: 0.72,
};

const toRgb = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const ACCENT = toRgb(NODE_GRAPH_PALETTE.accent);
const SPARK = toRgb(NODE_GRAPH_PALETTE.spark);

const strokeRun = (ctx, geometry, from, to, width, color) => {
  const first = Math.max(0, Math.floor(from / geometry.step));
  const last = Math.min(geometry.count - 1, Math.ceil(to / geometry.step));
  if (last <= first) return;
  ctx.beginPath();
  ctx.moveTo(geometry.xs[first], geometry.ys[first]);
  for (let at = first + 1; at <= last; at++) ctx.lineTo(geometry.xs[at], geometry.ys[at]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
};

const paintTraces = (ctx, edges) => {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  edges.forEach((edge) => {
    if (edge.drawn <= 0.001) return;
    const to = edge.geometry.length * easeOut(edge.drawn);
    const core = WEIGHT.coreFloor + edge.heat * WEIGHT.coreHeat;
    strokeRun(ctx, edge.geometry, 0, to, WEIGHT.traceCase, NODE_GRAPH_PALETTE.traceCase);
    strokeRun(ctx, edge.geometry, 0, to, WEIGHT.traceWell, NODE_GRAPH_PALETTE.traceWell);
    if (edge.heat > 0.02) strokeRun(ctx, edge.geometry, 0, to, WEIGHT.traceHeat, `rgba(${ACCENT},${edge.heat * WEIGHT.heatWash})`);
    strokeRun(ctx, edge.geometry, 0, to, WEIGHT.traceCore, `rgba(${ACCENT},${core})`);
  });
};

const paintPulses = (ctx, board) => {
  ctx.lineCap = 'round';
  board.pulses.forEach((pulse) => {
    const { geometry } = board.edges[pulse.edge];
    for (let at = 0; at < NODE_GRAPH.pulseSegments; at++) {
      const head = pulse.travelled - (NODE_GRAPH.pulseTail * at) / NODE_GRAPH.pulseSegments;
      if (head <= 0) continue;
      const tail = pulse.travelled - (NODE_GRAPH.pulseTail * (at + 1)) / NODE_GRAPH.pulseSegments;
      const alpha = (1 - at / NODE_GRAPH.pulseSegments) * WEIGHT.trailAlpha;
      strokeRun(ctx, geometry, Math.max(0, tail), Math.min(geometry.length, head), WEIGHT.pulseTrail, `rgba(${ACCENT},${alpha})`);
    }
    const step = Math.max(0, Math.min(geometry.count - 1, Math.round(pulse.travelled / geometry.step)));
    const x = geometry.xs[step],
      y = geometry.ys[step];
    const glow = ctx.createRadialGradient(x, y, 0, x, y, WEIGHT.pulseGlow);
    glow.addColorStop(0, `rgba(${ACCENT},${WEIGHT.glowAlpha})`);
    glow.addColorStop(1, `rgba(${ACCENT},0)`);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, WEIGHT.pulseGlow, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = NODE_GRAPH_PALETTE.spark;
    ctx.beginPath();
    ctx.arc(x, y, WEIGHT.pulseHead, 0, Math.PI * 2);
    ctx.fill();
  });
};

const paintGlyph = (ctx, role, box, color) => {
  const draw = GLYPHS[role];
  if (!draw) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = box * WEIGHT.glyphStroke;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw(ctx, box * WEIGHT.glyphBox);
};

const paintShell = (ctx, x, y, box) => {
  const half = box / 2;
  ctx.beginPath();
  ctx.roundRect(x - half - 0.8, y - half - WEIGHT.moduleLift, box, box, box * WEIGHT.moduleRadius);
  ctx.fillStyle = NODE_GRAPH_PALETTE.moduleLift;
  ctx.fill();
  const shell = ctx.createLinearGradient(x - half, y - half, x + half, y + half);
  shell.addColorStop(0, NODE_GRAPH_PALETTE.moduleTop);
  shell.addColorStop(0.5, NODE_GRAPH_PALETTE.moduleMid);
  shell.addColorStop(1, NODE_GRAPH_PALETTE.moduleFoot);
  ctx.beginPath();
  ctx.roundRect(x - half, y - half, box, box, box * WEIGHT.moduleRadius);
  ctx.fillStyle = shell;
  ctx.fill();
  ctx.strokeStyle = NODE_GRAPH_PALETTE.moduleEdge;
  ctx.lineWidth = WEIGHT.moduleEdge;
  ctx.stroke();
};

const paintHalo = (ctx, x, y, box, lit) => {
  const halo = ctx.createRadialGradient(x, y, 0, x, y, box * WEIGHT.indicatorRing);
  halo.addColorStop(0, `rgba(${ACCENT},${lit * WEIGHT.litWash})`);
  halo.addColorStop(1, `rgba(${ACCENT},0)`);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, box * WEIGHT.indicatorRing, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
};

const paintRing = (ctx, x, y, side, radius, color) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = WEIGHT.ringLine;
  ctx.beginPath();
  ctx.roundRect(x - side / 2, y - side / 2, side, side, radius);
  ctx.stroke();
};

const paintModules = (ctx, board) => {
  board.modules.forEach((unit, index) => {
    if (unit.appear <= 0.001) return;
    const { x, y, size, role } = NODE_GRAPH.nodes[index];
    const isEngine = index === NODE_GRAPH.engine;
    const grown = easeOut(unit.appear);
    const box = size * (WEIGHT.appearFloor + (1 - WEIGHT.appearFloor) * grown);
    const lit = Math.min(1, (WEIGHT.litFloor + unit.glow * WEIGHT.litGlow) * (isEngine ? WEIGHT.engineLift : 1));
    ctx.globalAlpha = grown;
    if (isEngine) {
      const ring = box * WEIGHT.engineRing;
      paintRing(ctx, x, y, ring, ring * WEIGHT.moduleRadius, `rgba(${ACCENT},${WEIGHT.engineRingAlpha})`);
    }
    if (unit.ring > 0.02) {
      const spread = (1 - unit.ring) * WEIGHT.ringSpread;
      paintRing(ctx, x, y, box + spread, WEIGHT.ringRadius, `rgba(${ACCENT},${unit.ring * WEIGHT.ringAlpha})`);
    }
    paintShell(ctx, x, y, box);
    paintHalo(ctx, x, y, box, lit);
    ctx.save();
    ctx.translate(x, y);
    paintGlyph(ctx, role, box, `rgba(${ACCENT},${lit})`);
    if (unit.glow > WEIGHT.sparkFloor) paintGlyph(ctx, role, box, `rgba(${SPARK},${(unit.glow - WEIGHT.sparkFloor) * WEIGHT.sparkGain})`);
    ctx.restore();
    ctx.globalAlpha = 1;
  });
};

export const paintBoard = (ctx, board, view) => {
  const pixelWidth = Math.round(view.width * view.dpr),
    pixelHeight = Math.round(view.height * view.dpr);
  const scale = Math.min(view.width / NODE_GRAPH.width, view.height / NODE_GRAPH.height);
  const offsetX = view.dpr * ((view.width - NODE_GRAPH.width * scale) / 2);
  const offsetY = view.dpr * ((view.height - NODE_GRAPH.height * scale) / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pixelWidth, pixelHeight);
  ctx.setTransform(view.dpr * scale, 0, 0, view.dpr * scale, offsetX, offsetY);
  paintTraces(ctx, board.edges);
  paintPulses(ctx, board);
  paintModules(ctx, board);
};
