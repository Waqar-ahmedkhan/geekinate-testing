import { angleOrder, applyOrder } from './order';

// The pose the mark holds for the whole middle of the page: a body, sampled straight, that the shader bends into an S and slithers.
//
// The serpentine is deliberately NOT baked in here. If the S were part of the sampled positions, crawling would mean rewriting 26,000
// positions every frame on the CPU — and the wave would have to travel along a curve whose own arc length keeps changing. Sampling a
// straight rod and letting a travelling sine in the vertex shader supply the curve gives the shape and the motion from one term: at
// phase zero it is already an S, and advancing the phase is the crawl.
//
// `arc` is what makes that possible. It is the particle's position along the body, 0 at the nose and 1 at the tail tip, and it is the
// only thing the wave is a function of — so every particle on the same cross-section moves together and the body stays solid instead
// of shearing.
export function sampleSnake(count, { length, radius, flatten }) {
  const positions = new Float32Array(count * 3),
    arc = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    // Girth along the body. sin(pi * sqrt(t)) is thickest around a quarter of the way down and tapers to nothing at the tail, which is
    // the snake's own profile; the gaussian is the rounded nose, because that curve alone comes to a point at both ends.
    const nose = Math.exp(-((t / 0.05) ** 2)) * 0.92;
    const girth = radius * Math.max(nose, Math.sin(Math.PI * Math.sqrt(t)) * (1 - t * 0.15));
    // sqrt on the radius, so the disc fills evenly instead of crowding the axis.
    const spin = Math.random() * Math.PI * 2,
      spread = Math.sqrt(Math.random()) * girth;
    positions[i * 3] = Math.cos(spin) * spread;
    // Head at the bottom. Scrolling down moves the page up, so a body led from the top would be reversing into its own direction of
    // travel — the head has to point the way the reader is going.
    positions[i * 3 + 1] = (t - 0.5) * length;
    positions[i * 3 + 2] = Math.sin(spin) * spread * flatten;
    arc[i] = t;
  }
  const order = angleOrder(positions);
  return { points: applyOrder(positions, order, 3), arc: applyOrder(arc, order, 1) };
}
