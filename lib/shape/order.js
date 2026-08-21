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
