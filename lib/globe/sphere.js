// The shared maths for the globe: a seeded generator, the equirectangular-to-sphere mapping the land mask is read through, and the
// great-circle interpolation the arcs are built on. Kept apart from the layers that use it because all three are pure and all three
// are used by more than one of them.

const DEG = Math.PI / 180;

// mulberry32. The composition has to be identical on every load or it cannot be tuned by eye — see GLOBE.seed. One generator is
// threaded through the whole build rather than seeded per layer, so adding a layer does not reshuffle the ones before it.
export const seeded = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

// Longitude and latitude in degrees onto a sphere of the given radius, in three.js's axis convention: +y north, and the prime
// meridian facing +z so an untouched globe presents Africa and Europe to the camera — which is the reference's own framing.
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

// The squared straight-line distance between two points held in flat arrays. Squared because every caller is comparing it against a
// threshold, and on a unit sphere a chord orders the same way the arc between its ends does.
export const gap2 = (a, at, b, bt) => {
  const dx = a[at] - b[bt],
    dy = a[at + 1] - b[bt + 1],
    dz = a[at + 2] - b[bt + 2];
  return dx * dx + dy * dy + dz * dz;
};

// Spherical linear interpolation between two unit vectors, scaled to `radius` on the way out. This is what makes an arc a great
// circle rather than a chord bent upward: every intermediate point is a real direction from the centre, so the path lies in the
// plane the two ends share and reads as a route over a globe.
//
// The degenerate case is two nearly identical directions, where the sine of the angle goes to zero and the weights blow up. Callers
// here never produce one — arcs are rejected below GLOBE.arcSpan's floor — but the guard costs a comparison and removes the class.
export const slerp = (a, b, angle, t, radius, into, at = 0) => {
  const sine = Math.sin(angle);
  const from = sine > 1e-6 ? Math.sin((1 - t) * angle) / sine : 1 - t,
    to = sine > 1e-6 ? Math.sin(t * angle) / sine : t;
  for (let axis = 0; axis < 3; axis += 1) into[at + axis] = (a[axis] * from + b[axis] * to) * radius;
  return into;
};
