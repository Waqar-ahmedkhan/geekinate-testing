import { sortByAngle } from './order';

export function sampleCloud(count, { radius, flatten }) {
  const positions = new Float32Array(count * 3);
  const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = gaussian() * radius * 0.42;
    positions[i * 3 + 1] = gaussian() * radius * 0.42;
    positions[i * 3 + 2] = gaussian() * radius * 0.42 * flatten;
  }
  return sortByAngle(positions);
}
