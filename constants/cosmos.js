// Every tunable number for the fixed particle scene, held here so the components below read as behaviour rather than as a pile of
// magic floats. `count` is the only entry that costs anything: it sizes the typed arrays allocated once at mount, and nothing
// reallocates after that.
//
// Distances are world units on a plane at z = 0, seen by a camera parked at `cameraZ` with a vertical field of view of `cameraFov`.
// The visible height at that plane is 2 * cameraZ * tan(cameraFov / 2) = 7.46, so a radius of 2.95 puts the mark at roughly
// four-fifths of the viewport height.
export const COSMOS = {
  count: 26000,
  cameraFov: 45,
  cameraZ: 9,
  glyphRadius: 2.95,
  // Nearly flat. The mark is a flat logo and every unit of depth here costs edge definition twice over — the silhouette scatters
  // across a band instead of a line, and depth attenuation then draws the near particles larger than the far ones inside the same
  // stroke. At 0.44 the letterform read as blurred; the cloud keeps its own volume through cloudFlatten and does not need this.
  glyphDepth: 0.15,
  // The snake the mark holds between the hero and the footer. Sampled as a straight rod; the S and the crawl both come from one
  // travelling sine in the shader, so these are the body and the wave, not a path.
  snakeLength: 5.2,
  snakeRadius: 0.46,
  snakeFlatten: 0.85,
  snakeWaves: 2.5,
  snakeAmplitude: 0.9,
  // Radians of wave phase per full page scroll, plus a slow idle so the body still breathes when nobody is scrolling. The scroll term
  // is what makes it crawl rather than wriggle in place — reverse the scroll and it crawls backwards, which is correct.
  crawlPerScroll: 44,
  crawlIdle: 0.4,
  cloudRadius: 3.4,
  cloudFlatten: 0.5,
  // Breathing room between the mark and the container edge it is anchored to, in world units. The mark is placed by its right edge
  // rather than by a centre offset — see MorphCloud — so this is the only placement number left.
  heroEdgeMargin: 0.08,
  // The hero pose, relative to the footer one. It was cut to 0.68 while a paragraph still hung off the bottom-right corner and the
  // mark had to clear it; with that gone the mark can hold the right half properly, and at anything smaller it floats in the middle
  // of its own column with dead space on both sides.
  heroScale: 0.9,
  // Pointer attraction. `pullRadius` is the world radius of influence and `pullStrength` the fraction of the remaining distance a
  // particle covers at the centre of it. Both were cut hard after the first pass: a wide radius at full strength peels half the mark
  // off in one lobe, where the reference lifts a thin ribbon out of the edge nearest the cursor.
  pullRadius: 1.05,
  pullStrength: 0.72,
  pointerLerp: 0.14,
  pointerTrail: 0.045,
  swirl: 0.55,
  driftSpeed: 0.22,
  driftAmount: 0.06,
  // How much extra drift the scattered pose carries over the formed one. The letterform has to hold still to be read; the cloud has
  // to keep moving or the middle of the page reads as a frozen image.
  driftLoose: 3.5,
  morphSpread: 0.34,
  formLerp: 5,
  pointSize: 10,
  // The mark is volt. `sparkle` is the share of particles lifted toward paper so the cloud carries highlights instead of reading as
  // one flat green, and `gloss` is the white core every bead gets — that core is what makes the volt read as glossy rather than as
  // printed ink, because the mark is a cloud of small spheres and a sphere lit from the front has a specular at its centre.
  sparkle: 0.34,
  gloss: 0.5,
  // The substrate. A grid of cells running a Life-like rule, seeded by the mark — see substrateShaders for why this replaced a
  // starfield. cell is CSS pixels per cell, so the grid is roughly 119 x 53 at desktop. Tuned at /lab, between the Sparse and Alive
  // presets: sparse enough to sit behind body copy, live enough that the rule is visibly doing work rather than dusting the screen.
  cell: 16,
  // Generations per second, not frames. The afterglow covers the gap between them, so the field reads as continuous while the rule
  // runs at a sixth of the render rate.
  stepRate: 11,
  decay: 0.89,
  // Chance per cell per generation of a cell appearing out of nothing. Life on an empty grid settles at nothing, and a background
  // that goes blank ten seconds after load is not a background.
  spawn: 0.0008,
  // How many cells wide the mark stamps per particle. Below about three the stamp lands sub-pixel in a grid this coarse and the wake
  // comes out as speckle rather than a trail.
  // The share of the mark's silhouette that seeds on any one generation. Stamping the whole thing eleven times a second saturates
  // every cell it touches and the wake comes out as a solid block travelling down the page rather than a trail. Sparse seeding lets
  // the rule do the work — most of what is visible was born from the seeds, not placed.
  seedChance: 0.05,
  dotSize: 0.32,
  substrateOpacity: 0.55,
  // Rows the lattice travels per full page scroll, plus a slow idle. The scroll term is what makes the wake pull away from the mark;
  // the idle term is what keeps the field moving when the page is not.
  wake: 1.6,
  wakeIdle: 0.012,
  // Idle life. Nothing here is triggered by anything — the mark is never truly still, because a fixed shape on a moving starfield
  // reads as a decal stuck to the glass. A slow sway on both axes and a long vertical bob, on different periods so they never line
  // up into an obvious loop. The substrate above carries the rest of the life.
  //
  // A travelling band of light across the body was tried here too and cut on sight — at any width it read as a stripe painted over
  // the mark rather than as light moving across it, because these particles are flat sprites with no normals for a highlight to
  // actually fall on.
  sway: 0.055,
  swaySpeed: 0.17,
  bob: 0.1,
  bobSpeed: 0.31,
  tilt: 0.16,
  tiltLerp: 0.06,
};
