// Every tunable number for the fixed particle scene, held here so the components below read as behaviour rather than as a pile of
// magic floats. `count` is the only entry that costs anything: it sizes the typed arrays allocated once at mount, and nothing
// reallocates after that.
//
// Distances are world units on a plane at z = 0, seen by a camera parked at `cameraZ` with a vertical field of view of `cameraFov`.
// The visible height at that plane is 2 * cameraZ * tan(cameraFov / 2) = 7.46, so a radius of 2.95 puts the mark at roughly
// four-fifths of the viewport height.
export const COSMOS = {
  count: 12000,
  cameraFov: 45,
  cameraZ: 9,
  glyphRadius: 2.95,
  // How far the middle of a stroke stands off the page. This used to be a random z spread and had to be held at 0.15, because
  // scattering particles through a slab blurs the silhouette across a band and buys no solidity at all — the mark read as a flat
  // stencil whatever the number was. It is now the height of a profile taken from the distance to the stroke's own edge, so the
  // outline sits at exactly z = 0 and only the centre line lifts. Against a stroke half-width of about 0.47 world units, 0.5 puts
  // the surface at roughly 45 degrees at the edge: a round tube rather than a bevel.
  glyphDepth: 0.5,
  // How far the loosest particles are thrown clear of that surface. The rounded profile pins the outline to a line, which is what
  // gained the mark its volume and also cost it the frayed edge it used to have — this buys the fray back without giving up the
  // sharpness, because the roll behind it is a fourth power and almost everything lands near nothing.
  glyphFray: 0.18,
  // How the mark turns about its own vertical through the middle of the page. `spinRange` is the furthest it goes either way, in
  // radians — a little over sixty degrees, which is as far as this letterform can turn and still be read; `spinTurns` is how many
  // times it swings out and back across a full page scroll. The idle pair keeps it moving while the page is still. All of it is
  // scaled by how deep into the body of the page the scroll is, so the hero and the footer are always square to the camera.
  spinRange: 1.12,
  spinTurns: 1.25,
  spinIdle: 0.14,
  spinIdleSpeed: 0.31,
  // The scattered pose. Cut from 3.4 because the dispersal read as a burst rather than a loosening — the cloud is what the mark
  // becomes on the way down the page, and a radius well past the letterform's own throws the particles outward hard enough that the
  // eye tracks the explosion instead of the shape leaving.
  cloudRadius: 3,
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
  driftLoose: 2.6,
  // The share of the form range each particle owns, so they do not all leave and arrive together. Raised because the handover is the
  // one moment the eye is guaranteed to be watching: a narrow spread reads as the whole mark stepping apart at once, a wide one as
  // it coming loose from the edges inward, which is the same motion spent over more frames.
  morphSpread: 0.55,
  // How fast the scene damps toward whatever the scroll triggers are asking for. This is the brake on the handover, not the trigger
  // range — the range says how much scroll the change is spread over, this says how hard the scene chases it within that.
  formLerp: 3,
  pointSize: 8.6,
  // The mark is volt. `sparkle` is the share of particles lifted toward paper so the cloud carries highlights instead of reading as
  // one flat green, and `gloss` is the white core every bead gets — that core is what makes the volt read as glossy rather than as
  // printed ink, because the mark is a cloud of small spheres and a sphere lit from the front has a specular at its centre.
  // The share of particles lifted off volt toward the highlight — black grit on the hero's paper ground, white on the void.
  sparkle: 0.26,
  // How dark the centre of each bead goes. This is what separates one grain from the next: without it every particle is a flat disc
  // with a feathered rim and the field reads as a haze rather than as beads. Directional lighting is not a substitute — that shades
  // across the whole stroke, this shades across each particle.
  beadCore: 0.4,
  // Left low deliberately. There is already a dark core in every bead, and a pale specular over the top of it on the same particle
  // only muddies both — this is a hint of sheen along the lit side, nothing more.
  gloss: 0.12,
  // The mark's value range, as distances from volt toward ink and toward paper. The shaded side has to go far enough that the
  // rounding is legible on a paper ground, where the ground itself is lighter than the mark; the sheen stops well short of white so
  // the specular reads as a wet green rather than as a white speck on every bead.
  //
  // Volt is the brand's only accent and the shade term is subtracted from it everywhere the surface turns away — too much of it and
  // the mark is a green object rather than a volt one, which is a colour decision smuggled in as a lighting one. It went 0.6, then
  // 0.45, and is 0.28 now: at anything higher the rims of every stroke darken enough to read as an outline around a hollow, which is
  // the opposite of the dense field this is meant to be.
  shadeDepth: 0.28,
  sheenLift: 0.7,
  // The substrate. A grid of cells running a Life-like rule, seeded by the mark — see substrateShaders for why this replaced a
  // starfield. cell is CSS pixels per cell, so the grid is roughly 107 x 60 at desktop. Coarsened from 16: cell area is the real
  // density control here, and 16 put around 8,400 cells on a desktop screen, which read as a dense field rather than a background.
  // Not coarser than this, though — the stamp is lattice-aligned, and past about 20 the rows and columns of the seeded region become
  // legible as a grid instead of as a wake.
  cell: 18,
  // Generations per second, not frames. The afterglow covers the gap between them, so the field reads as continuous while the rule
  // runs at a tenth of the render rate. Halved from 11 — this is the number that governs how fast the field appears to move, and at
  // eleven the churn was quick enough to pull the eye off the copy in front of it.
  stepRate: 6,
  // Per generation, so the wall-clock length of the fade is decay against stepRate, not decay alone — and that is why it came back
  // down when the rate did. Raising it to 0.92 alongside the slower rule was the intuitive move and it worked against the density
  // cut: a longer fade means more cells lit at once, so the field filled in again as the page was scrolled. At 0.88 against six
  // generations a second a cell still takes most of a second to go out, which is smooth, without holding the whole trail alive.
  decay: 0.88,
  // Chance per cell per generation of a cell appearing out of nothing. Life on an empty grid settles at nothing, and a background
  // that goes blank ten seconds after load is not a background.
  //
  // It was halved to 0.0004 to thin the field and that was the wrong lever. Spontaneous births are the only source of life anywhere
  // the mark is not, so cutting them does not make the field sparser — it makes one side of the page arrive a minute late. The
  // opening state is `seedDensity` below and the thinning is carried by opacity instead, where it belongs.
  spawn: 0.0009,
  // How much of the grid is alive the moment it is allocated. Around a tenth is the classic Life soup: dense enough that the rule
  // has something to work with immediately across the full width, sparse enough that it settles into structure rather than mush.
  seedDensity: 0.09,
  // How many cells wide the mark stamps per particle. Below about three the stamp lands sub-pixel in a grid this coarse and the wake
  // comes out as speckle rather than a trail.
  // The share of the mark's silhouette that seeds on any one generation. Stamping the whole thing eleven times a second saturates
  // every cell it touches and the wake comes out as a solid block travelling down the page rather than a trail. Sparse seeding lets
  // the rule do the work — most of what is visible was born from the seeds, not placed.
  seedChance: 0.04,
  dotSize: 0.3,
  // Two absolute opacities, one per ground, lerped between as the wash fades — not a single value with a discount on paper, which
  // is what this was first. The assumption behind the discount was that white would carry the dots harder than the void does; it is
  // volt and grey on paper against volt and grey on near-black, and the paper side actually came out the weaker of the two. The
  // "too heavy" note that started all of this was about the black hero, which no longer exists.
  substrateOpacity: 0.38,
  substrateOpacityLight: 0.44,
  // Where the hero's field starts and finishes coming in, as a fraction of viewport width. The copy column runs out at about 0.39
  // and the mark starts at about 0.57, so the ramp sits in the gap between them: nothing under the type, full strength by the time
  // the mark is reached. Measured against the viewport rather than the container because the field is full-bleed.
  maskStart: 0.42,
  maskEnd: 0.68,
  // Rows the lattice travels per full page scroll, plus a slow idle. The scroll term is what makes the wake pull away from the mark;
  // the idle term is what keeps the field moving when the page is not. Both cut: the idle drift is the motion present on a page
  // nobody is touching, so it is the one that has to sit below notice.
  wake: 1.2,
  wakeIdle: 0.006,
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
