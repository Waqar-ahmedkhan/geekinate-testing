import { GRAIN } from '@/constants';

const INK = 0,
  VOLT = 1,
  PAPER = 2;

export const createGrain = (count) => ({
  x: new Float32Array(count),
  y: new Float32Array(count),
  vx: new Float32Array(count),
  vy: new Float32Array(count),
  age: new Float32Array(count).fill(1),
  span: new Float32Array(count).fill(1),
  size: new Float32Array(count),
  hot: new Float32Array(count),
  tint: new Uint8Array(count),
  count,
  head: 0,
  alive: 0,
  pending: 0,
  ringPending: 0,
});

const spawn = (pool, x, y, vx, vy, options) => {
  const index = pool.head;
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * GRAIN.spread;
  pool.x[index] = x + (Math.random() * 2 - 1) * GRAIN.jitter;
  pool.y[index] = y + (Math.random() * 2 - 1) * GRAIN.jitter;
  pool.vx[index] = vx * options.carry + Math.cos(angle) * speed;
  pool.vy[index] = vy * options.carry + Math.sin(angle) * speed;
  pool.age[index] = 0;
  pool.span[index] = GRAIN.life * options.lifeScale * (1 + (Math.random() * 2 - 1) * GRAIN.lifeSpread);
  pool.size[index] = GRAIN.size * (1 + (Math.random() * 2 - 1) * GRAIN.sizeSpread);
  pool.tint[index] = Math.random() < GRAIN.voltShare ? VOLT : options.light ? INK : PAPER;
  pool.head = (index + 1) % pool.count;
};

export function shedGrain(pool, x, y, vx, vy, travelled, light) {
  if (travelled > GRAIN.travelCap) return;
  pool.pending += travelled * GRAIN.emitPerPixel;
  const budget = Math.min(Math.floor(pool.pending), GRAIN.emitPerFrame);
  pool.pending -= budget;
  const options = { carry: GRAIN.inherit, lifeScale: 1, light };
  for (let i = 0; i < budget; i += 1) spawn(pool, x, y, vx, vy, options);
}

export function shedRing(pool, ring, delta, light) {
  pool.ringPending += ring.rate * ring.presence * delta;
  const budget = Math.min(Math.floor(pool.ringPending), GRAIN.emitPerFrame * 2);
  pool.ringPending -= budget;
  const options = { carry: 1, lifeScale: ring.life, light };
  for (let i = 0; i < budget; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = ring.radius + (Math.random() * 2 - 1) * GRAIN.ringJitter;
    const spin = ring.orbit * ring.presence;
    const x = ring.x + Math.cos(angle) * radius;
    const y = ring.y + Math.sin(angle) * radius;
    spawn(pool, x, y, -Math.sin(angle) * spin, Math.cos(angle) * spin, options);
  }
}

const cursorForce = (pool, index, cursor, delta) => {
  const dx = cursor.x - pool.x[index],
    dy = cursor.y - pool.y[index];
  const distance = Math.hypot(dx, dy) || 0.0001;
  const reach = Math.max(0, 1 - distance / cursor.radius);
  const heat = reach * reach * (3 - 2 * reach);
  if (heat <= 0) return 0;
  const nx = dx / distance,
    ny = dy / distance;
  const hold = 1 - Math.exp(-cursor.grip * heat * delta);
  pool.vx[index] += (nx * distance * cursor.pull - ny * cursor.swirl - pool.vx[index]) * hold;
  pool.vy[index] += (ny * distance * cursor.pull + nx * cursor.swirl - pool.vy[index]) * hold;
  return heat;
};

export function stepGrain(pool, delta, ring, cursor) {
  const damp = Math.exp(-GRAIN.drag * delta);
  const grip = ring ? 1 - Math.exp(-GRAIN.ringGrip * ring.presence * delta) : 0;
  let alive = 0;
  for (let i = 0; i < pool.count; i += 1) {
    if (pool.age[i] >= pool.span[i]) continue;
    pool.age[i] += delta;
    if (pool.age[i] >= pool.span[i]) continue;
    pool.vy[i] = pool.vy[i] * damp + GRAIN.sink * delta;
    pool.vx[i] *= damp;
    if (grip > 0) {
      const dx = pool.x[i] - ring.x,
        dy = pool.y[i] - ring.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const nx = dx / distance,
        ny = dy / distance;
      const gap = (ring.radius - distance) * GRAIN.ringPull;
      pool.vx[i] += (nx * gap - ny * ring.orbit - pool.vx[i]) * grip;
      pool.vy[i] += (ny * gap + nx * ring.orbit - pool.vy[i]) * grip;
    }
    pool.hot[i] = cursor ? cursorForce(pool, i, cursor, delta) : 0;
    pool.x[i] += pool.vx[i] * delta;
    pool.y[i] += pool.vy[i] * delta;
    alive += 1;
  }
  pool.alive = alive;
}

export const grainFade = (t) => (t < GRAIN.fadeIn ? t / GRAIN.fadeIn : (1 - t) ** 3 / (1 - GRAIN.fadeIn) ** 3);
