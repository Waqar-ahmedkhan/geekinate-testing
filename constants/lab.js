// Presets for the background prototype at /lab. They exist so the idea can be judged before it is wired into the site, and they are
// deliberately spread wide — the point is to find out which end of the range reads as atmosphere and which reads as wallpaper.
//
// `cell` is CSS pixels per cell, `rate` generations per second, `spawn` the chance of a cell appearing out of nothing, `decay` how
// slowly a dead cell fades, `drift` rows travelled per second.
export const LAB_PRESETS = [
  {
    name: 'Sparse',
    cell: 18,
    rate: 10,
    spawn: 0.0004,
    decay: 0.88,
    dot: 0.3,
    opacity: 0.55,
    drift: 0.35,
    note: 'Barely there. Cells appear rarely and most of what moves is the wake the cursor leaves behind. Closest to atmosphere.',
  },
  {
    name: 'Alive',
    cell: 14,
    rate: 12,
    spawn: 0.0015,
    decay: 0.9,
    dot: 0.36,
    opacity: 0.6,
    drift: 0.5,
    note: 'The rule is doing visible work — gliders and blinkers survive long enough to be read as behaviour rather than noise.',
  },
  {
    name: 'Dense',
    cell: 11,
    rate: 14,
    spawn: 0.004,
    decay: 0.92,
    dot: 0.4,
    opacity: 0.7,
    drift: 0.7,
    note: 'Busy. Included as the upper bound: this is where the field stops being a background and starts competing with the copy.',
  },
  {
    name: 'Wake only',
    cell: 15,
    rate: 12,
    spawn: 0,
    decay: 0.86,
    dot: 0.34,
    opacity: 0.65,
    drift: 0.45,
    note: 'No spontaneous births at all. Everything on screen was seeded by the mark, so the page is blank until something moves.',
  },
];
