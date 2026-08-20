// The grain pool: flat typed arrays, allocated once, walked twice a frame. No DOM in here and no canvas — this module is the
// simulation, and the component beside it is the only thing that knows a screen exists.
//
// These functions mutate the pool rather than returning a new one, which is the one place this codebase spends its preference for
// pure functions. Three hundred beads is 2.2KB of Float32Array; rebuilding that every frame to keep the signature honest would
// allocate 130KB a second for a garbage collector to pick up in the middle of a scroll.
import { GRAIN } from '@/constants';

// Sprite indices, and the reason there are three. Ink is the bead on a light ground and paper is the bead on a dark one — the same
// swap the whole site makes, for the same reason: a light particle on a light ground is not a subtle particle, it is an absent one.
// Volt is the accent share and is legible on both, so it never switches.
const INK = 0,
  VOLT = 1,
  PAPER = 2;

// A bead is alive while `age < span`. Nothing is ever removed — `head` walks the ring and overwrites whatever is oldest, which is
// dead in every case the pool is sized for.
export const createGrain = (count) => ({
  x: new Float32Array(count),
  y: new Float32Array(count),
  vx: new Float32Array(count),
  vy: new Float32Array(count),
  age: new Float32Array(count).fill(1),
  span: new Float32Array(count).fill(1),
  size: new Float32Array(count),
  tint: new Uint8Array(count),
  count,
  head: 0,
  alive: 0,
  pending: 0,
  ringPending: 0,
});

// `carry` is how much of the velocity handed in the bead keeps. The wake passes the pointer's own velocity and keeps a fraction of
// it, because grain is shed and left behind rather than thrown; the ring passes the tangential speed it wants and keeps all of it.
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

// Distance in, beads out. `pending` carries the fraction between calls so a slow drag still sheds — rounding per frame would floor
// anything under one bead a frame to nothing, and a slow deliberate move over a card is exactly the gesture worth answering.
export function shedGrain(pool, x, y, vx, vy, travelled, light) {
  if (travelled > GRAIN.travelCap) return;
  pool.pending += travelled * GRAIN.emitPerPixel;
  const budget = Math.min(Math.floor(pool.pending), GRAIN.emitPerFrame);
  pool.pending -= budget;
  const options = { carry: GRAIN.inherit, lifeScale: 1, light };
  for (let i = 0; i < budget; i += 1) spawn(pool, x, y, vx, vy, options);
}

// The same emitter driven by time instead of distance, laying beads straight onto the circle with the tangential velocity they need
// to already be orbiting. Placing them on the ring rather than at the cursor and letting the steering carry them out matters: a bead
// that has to travel from the centre spends the first third of its life in the middle of the ring, and the ring reads as a filled
// disc that is slowly clearing.
export function shedRing(pool, x, y, presence, delta, light) {
  pool.ringPending += GRAIN.ringPerSecond * presence * delta;
  const budget = Math.min(Math.floor(pool.ringPending), GRAIN.emitPerFrame * 2);
  pool.ringPending -= budget;
  const options = { carry: 1, lifeScale: GRAIN.ringLife, light };
  for (let i = 0; i < budget; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = GRAIN.ringRadius + (Math.random() * 2 - 1) * GRAIN.ringJitter;
    const spin = GRAIN.ringOrbit * presence;
    spawn(pool, x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, -Math.sin(angle) * spin, Math.cos(angle) * spin, options);
  }
}

// One integration step, and the live count as a side effect so the renderer can skip the whole draw when the field is empty.
//
// Drag is exponential rather than a per-frame multiply, so the coast is the same shape whatever the frame rate — a linear damp
// tuned at 60fps decays at half the rate on a 120Hz display and twice the rate on a stuttering one.
//
// `ring` is null whenever the page is still, and that is the whole of the ring's exit: the steering stops, and the drag and the sink
// that were running the entire time take over a field of beads that happen to be arranged in a circle. Nothing eases the ring out
// because nothing has to — it comes apart the way the wake always did.
export function stepGrain(pool, delta, ring) {
  const damp = Math.exp(-GRAIN.drag * delta);
  const grip = ring ? 1 - Math.exp(-GRAIN.ringGrip * ring.presence * delta) : 0;
  let alive = 0;
  for (let i = 0; i < pool.count; i += 1) {
    if (pool.age[i] >= pool.span[i]) continue;
    pool.age[i] += delta;
    if (pool.age[i] >= pool.span[i]) continue;
    pool.vy[i] = pool.vy[i] * damp + GRAIN.sink * delta;
    pool.vx[i] *= damp;
    // Steered after the drag, not before. Before it, the drag pulls the bead back off the velocity it was just given and the orbit
    // settles at whatever fraction of nominal the two rates happen to agree on.
    if (grip > 0) {
      const dx = pool.x[i] - ring.x,
        dy = pool.y[i] - ring.y;
      const distance = Math.hypot(dx, dy) || 0.0001;
      const nx = dx / distance,
        ny = dy / distance;
      // One target velocity, not two forces: the radial term closes the gap to the radius and the tangential term carries the bead
      // round it, and steering toward their sum is what stops a bead overshooting the circle it is trying to join.
      const gap = (GRAIN.ringRadius - distance) * GRAIN.ringPull;
      pool.vx[i] += (nx * gap - ny * GRAIN.ringOrbit - pool.vx[i]) * grip;
      pool.vy[i] += (ny * gap + nx * GRAIN.ringOrbit - pool.vy[i]) * grip;
    }
    pool.x[i] += pool.vx[i] * delta;
    pool.y[i] += pool.vy[i] * delta;
    alive += 1;
  }
  pool.alive = alive;
}

// Arrive fast, leave slow. The rise is linear over a short head of the life and the fall is a cubic ease, which is what makes the
// wake read as settling out rather than as a row of dots switching off.
export const grainFade = (t) => (t < GRAIN.fadeIn ? t / GRAIN.fadeIn : (1 - t) ** 3 / (1 - GRAIN.fadeIn) ** 3);
