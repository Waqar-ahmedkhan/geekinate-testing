// Every cloud is sampled independently and at random, so particle i starts nowhere near where it has to end up. Left alone a morph
// between two of them reads as static: every particle takes its own straight line and the cloud crosses itself in every direction at
// once. Sorting them all by the angle around their own centre makes index i mean the same bearing in each, so a shape assembles as a
// rotationally coherent sweep.
//
// Split into an order and an application because some shapes carry a companion attribute — the snake's arc position, for one — that
// has to be permuted by exactly the same order or it stops describing the particle it belongs to.
export function angleOrder(positions) {
  const total = positions.length / 3;
  const order = Array.from({ length: total }, (unused, index) => index);
  order.sort((a, b) => Math.atan2(positions[a * 3 + 1], positions[a * 3]) - Math.atan2(positions[b * 3 + 1], positions[b * 3]));
  return order;
}

export function applyOrder(values, order, stride) {
  const sorted = new Float32Array(values.length);
  order.forEach((from, to) => {
    for (let lane = 0; lane < stride; lane += 1) sorted[to * stride + lane] = values[from * stride + lane];
  });
  return sorted;
}

export function sortByAngle(positions) {
  return applyOrder(positions, angleOrder(positions), 3);
}
