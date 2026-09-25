export function angleOrder(positions) {
  const total = positions.length / 3;
  const angles = Float64Array.from({ length: total }, (unused, index) => Math.atan2(positions[index * 3 + 1], positions[index * 3]));
  const order = Array.from({ length: total }, (unused, index) => index);
  order.sort((a, b) => angles[a] - angles[b]);
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
