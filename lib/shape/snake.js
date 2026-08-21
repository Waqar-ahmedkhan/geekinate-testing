import { angleOrder, applyOrder } from './order';

export function sampleSnake(count, { length, radius, flatten }) {
  const positions = new Float32Array(count * 3),
    arc = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    const nose = Math.exp(-((t / 0.05) ** 2)) * 0.92;
    const girth = radius * Math.max(nose, Math.sin(Math.PI * Math.sqrt(t)) * (1 - t * 0.15));
    const spin = Math.random() * Math.PI * 2,
      spread = Math.sqrt(Math.random()) * girth;
    positions[i * 3] = Math.cos(spin) * spread;
    positions[i * 3 + 1] = (t - 0.5) * length;
    positions[i * 3 + 2] = Math.sin(spin) * spread * flatten;
    arc[i] = t;
  }
  const order = angleOrder(positions);
  return { points: applyOrder(positions, order, 3), arc: applyOrder(arc, order, 1) };
}
