// Every tunable number for the fixed particle scene, held here so the components below read as behaviour rather than as a pile of
// magic floats. `count` is the only entry that costs anything: it sizes the typed arrays allocated once at mount, and nothing
// reallocates after that.
//
// Distances are world units on a plane at z = 0, seen by a camera parked at `cameraZ` with a vertical field of view of `cameraFov`.
// The visible height at that plane is 2 * cameraZ * tan(cameraFov / 2) = 7.456, so a radius of 2.05 puts the mark at a little over
// half the viewport height.
//
// **The camera is a long lens on purpose, and the pair is load-bearing.** It was 45 degrees at a distance of 9; it is now 7.1
// degrees at 60, which leaves that visible height unchanged to three decimal places and therefore leaves the letterform's framing,
// its fit and every number below it exactly where they were. What it buys is the globe.
//
// The hero pose is a sphere whose radius is about 8.8 world units — the reference's horizon is a wide shallow curve, and a shallow
// curve means a sphere several times taller than the frame. At a camera distance of 9 that sphere's front surface is nearer to the
// camera than the camera is to its own centre: the frustum swallows it and no field of view fixes that. At 60 the same sphere sits
// comfortably in front of the lens, the projection is near enough orthographic that the atmosphere shaders' screen-offset
// derivation holds to a few percent, and the depth cue on the point sizes is a gentle 17% across the globe rather than a fisheye.
//
// Changing one of the two without the other rescales the entire scene.
export const COSMOS = {
  // The size of the one buffer, and therefore the globe's own grain count — a world map is what needs the particles, and below about
  // twenty thousand the coastlines break up into speckle and the continents stop being recognisable.
  //
  // It used to be the letterform's count as well, because one buffer holding three poses gave the two shapes no way to disagree. The
  // mark wants far fewer than the map: at 26,000 packed into a glyph half a viewport tall the beads overlapped into a solid green
  // slab and the grain stopped reading as grain. `glyphCount` below is what separates them.
  count: 30000,
  // How many of those particles the letterform is made of. The rest keep their scattered position as their glyph target and fade out
  // as the mark assembles — see `aMark` in cloud and the `vFade` line in the vertex shader — so the mark is exactly this many beads
  // while the globe is still the full `count`. Must not exceed `count`.
  glyphCount: 20000,
  cameraFov: 7.111,
  cameraZ: 60,
  // Cut from 2.95 on 2026-08-20. At four-fifths of the viewport height the mark was the footer rather than an element in it, and it
  // could not share the panel with anything — the content had to be pushed to the top and bottom rails to leave it the middle. At
  // this size it holds the right of the panel and the content holds the left. Taken back up from 1.7 the same day: half a viewport
  // read as timid in a half of its own, and the right half has the width for it.
  glyphRadius: 2.05,
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
  // Breathing room between the mark and the container edge it was anchored to, in world units. Nothing reads it: the mark is placed
  // by the centre of the footer's right half now — see MorphCloud — and a centre offset has no edge to keep clear.
  heroEdgeMargin: 0.08,
  // The hero pose, relative to the footer one. It was cut to 0.68 while a paragraph still hung off the bottom-right corner and the
  // mark had to clear it; with that gone the mark can hold the right half properly, and at anything smaller it floats in the middle
  // of its own column with dead space on both sides. Nothing reads it since the hero became the globe.
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
  //
  // Raised from 3 when the form curve went linear. At 3 the mark trails the scroll by about a third of a second, which is invisible
  // on a slow read and reads as the letterform snapping together a beat late when the wheel is spun — the lag was doing some of the
  // easing, and with the curve no longer front-loading anything there is nothing for it to smooth over.
  formLerp: 4.5,
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
  // Idle life. Nothing here is triggered by anything — the mark is never truly still, because a fixed shape on a moving starfield
  // reads as a decal stuck to the glass. A slow sway on both axes and a long vertical bob, on different periods so they never line
  // up into an obvious loop.
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
  // The globe pose ------------------------------------------------------------------------------------------------------------
  // Everything from here down belongs to the hero, where this same cloud wears the Earth. The shape of that sphere and the shells
  // around it are GLOBE's; these are the numbers the *particles* need, which is why they live with the rest of the cloud's.
  //
  // Point size in pixels at rest, against the letterform's 8.6. A world map is a field of pins, not a field of beads: at the mark's
  // size the coastlines merge into a solid band well before there are enough particles to draw them.
  globePoint: 3.4,
  // How hard a particle turning away from the camera goes out. This is the globe's entire occlusion strategy — there is no depth
  // test anywhere in the scene, and there does not need to be, because a sphere hides its own back by simply not drawing it. The
  // window is deliberately narrow and biased a hair past the limb, so the field ends *at* the silhouette instead of thinning toward
  // it, which is what makes the rim read as an edge.
  globeFadeIn: -0.08,
  globeFadeOut: 0.05,
  // The cursor lift. `liftRadius` is measured on screen rather than in space — the particle and the pointer are compared on x and y
  // only — because the globe is eight world units deep and a true 3D radius reaches the front of it and nothing else. `lift` is how
  // far a particle rises along its own surface normal at the centre of that circle, so the field peels off the sphere rather than
  // sliding across it.
  globeLift: 0.42,
  globeLiftRadius: 1.3,
  // Drag to spin. `dragTurn` is radians of turn per pixel dragged and `dragDecay` how fast a fling bleeds off, per second — at 2.6
  // a hard throw coasts for about a second and a half, which is long enough to read as momentum and short enough not to fight the
  // idle turn.
  //
  // `dragTurn` is far smaller than one-to-one with the cursor, and that is not a mistake. The frame only ever shows the band near
  // the limb, where foreshortening squeezes a great deal of longitude into very few pixels — the map crosses that band several times
  // faster than the sphere is actually turning, so the honest ratio feels like a shove. It went 0.0052, where a three-hundred-pixel
  // drag spun the globe ninety degrees and the world tore past under the cursor, then 0.0016, and is 0.0008 now: the same drag turns
  // it about fourteen degrees, which is a hand resting on a heavy thing and pushing it round.
  dragTurn: 0.0008,
  dragDecay: 2.6,
  // What the scroll does on the way out of the hero: extra turns of spin, and how far the globe sinks in its own radii. Both ride on
  // the same progress that disperses the cloud, so the globe leaves under its own power rather than being slid off screen.
  scrollSpin: 3.4,
  scrollSink: 0.42,
  // How fast the pose crossfades chase the scroll. Lower than formLerp because this handover is a whole world coming apart rather
  // than a letterform loosening, and it wants to be seen.
  globeLerp: 2.2,
};
