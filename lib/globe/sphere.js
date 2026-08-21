const DEG = Math.PI / 180;

export const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const onSphere = (lon, lat, radius, into, at = 0) => {
  const polar = (90 - lat) * DEG,
    azimuth = (lon + 180) * DEG;
  const ring = Math.sin(polar) * radius;
  into[at] = -ring * Math.cos(azimuth);
  into[at + 1] = Math.cos(polar) * radius;
  into[at + 2] = ring * Math.sin(azimuth);
  return into;
};

export const dot3 = (a, at, b, bt) => a[at] * b[bt] + a[at + 1] * b[bt + 1] + a[at + 2] * b[bt + 2];

export const gap2 = (a, at, b, bt) => {
  const dx = a[at] - b[bt],
    dy = a[at + 1] - b[bt + 1],
    dz = a[at + 2] - b[bt + 2];
  return dx * dx + dy * dy + dz * dz;
};

export const slerp = (a, b, angle, t, radius, into, at = 0) => {
  const sine = Math.sin(angle);
  const from = sine > 1e-6 ? Math.sin((1 - t) * angle) / sine : 1 - t,
    to = sine > 1e-6 ? Math.sin(t * angle) / sine : t;
  for (let axis = 0; axis < 3; axis += 1) into[at + axis] = (a[axis] * from + b[axis] * to) * radius;
  return into;
};
