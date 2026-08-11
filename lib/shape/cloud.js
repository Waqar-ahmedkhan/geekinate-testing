import { sortByAngle } from './order';

// The scattered pose — what the particles hold for the whole middle of the page, and what the letterform comes apart into on the way
// out of the hero and back together out of at the footer.
//
// It is a pose, not an effect. Pushing the letterform outward along a random direction at render time was the first attempt, and it
// can only ever bulge: the cloud stays legible as a fattened G because every particle keeps its neighbours. Sampling a genuinely
// unrelated shape is what makes the dispersal read as a dispersal.
//
// Gaussian rather than uniform-in-sphere, because the reference's cloud is dense at the centre and ragged at the edge. Uniform in
// the volume gives the opposite — a hollow-looking shell, since most of a ball's volume is near its surface.
export function sampleCloud(count, { radius, flatten }) {
  const positions = new Float32Array(count * 3);
  const gaussian = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = gaussian() * radius * 0.42;
    positions[i * 3 + 1] = gaussian() * radius * 0.42;
    // Flattened toward the camera plane. A round ball reads as a sphere lit from nowhere; the reference's cloud is a disc of dots.
    positions[i * 3 + 2] = gaussian() * radius * 0.42 * flatten;
  }
  return sortByAngle(positions);
}
