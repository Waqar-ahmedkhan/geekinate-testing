// Every tunable for the hero globe's composition, atmosphere and network. Transcribed from
// docs/istockphoto-1405728317-612x612.jpg, the agreed reference for section 01 as of 2026-08-13: a dot-matrix Earth seen from below,
// only its upper cap in frame, network arcs above the surface and star flares at the junctions.
//
// The land itself is not tuned here. It is a pose of the mark's own particle cloud, so its count, size and shading are COSMOS's —
// see constants/cosmos. What is left is the shape of the frame, the shells around the globe and the network drawn over it.
//
// Distances are in globe radii or in half-viewport-heights; nothing here is in pixels, so nothing needs re-tuning per breakpoint.
export const GLOBE = {
  // The silhouette, and the only two numbers that set the composition. `apex` is where the top of the globe sits, measured from the
  // centre of the frame; `drop` is how far the limb has fallen by the time it reaches the left and right edges. Both come off the
  // reference: its apex sits within a percent of dead centre and its limb is about 62% of a half-height lower at the frame edge.
  //
  // Deriving the radius from these rather than setting it directly is what keeps the curve identical at every aspect ratio. A fixed
  // radius reads as a globe on a desktop and as a straight horizon on a phone, because the frame narrows and the same arc flattens.
  apex: 0.02,
  drop: 0.78,
  // The aspect the fit is allowed to see, and the one number that stops the composition from eating itself on a wide monitor. The
  // radius the two above imply grows with the square of the frame's width, so at 21:9 the sphere comes out twice the size the
  // reference's is — and because the frame only ever shows the band between the apex and its own bottom edge, a bigger sphere is a
  // *smaller* slice of map hugely magnified. At 2.2 the continents were unreadable blobs. Capped at 1.75 the globe is sized for a
  // 16:9-ish frame whatever the monitor is, and the widest screens lose only a sliver out of the bottom corners.
  //
  // The floor does the same job at the other end: below about 0.85 the sphere shrinks faster than the frame and lands as a small
  // ball in the lower half rather than as a world the page is standing on.
  aspectRange: [0.85, 1.75],
  // Axial tilt and the idle turn, in radians and radians per second. A globe spinning about a dead-vertical axis reads as a rotating
  // cylinder; a few degrees of lean is what makes it read as a body in space. The turn is slow on purpose — a full revolution in
  // about four minutes, which is motion you notice on the second look rather than on the first.
  tilt: 0.14,
  spin: 0.026,
  // How far a particle strays inside its own mask cell when the land pose is sampled. At full jitter it can cross into the
  // neighbouring cell, which is what softens the coastlines into something hand-placed rather than a staircase off a 0.7-degree grid.
  jitter: 0.85,
  // Just inside the land, so the particles sit *on* the surface rather than hovering off it. The particles are their own occlusion —
  // they fade out as they turn away from the camera — so nothing here depends on a depth test.
  oceanRadius: 0.994,
  // The network. Anchors are the junctions: arcs start and end on them and the flares sit on them, which is what makes a flare read
  // as the network firing rather than as glitter sprinkled over a map. `groups` is the four service pillars, which the anchors are
  // dealt out to round-robin so a pillar hover in the hero lights a spread rather than one continent.
  anchorCount: 56,
  anchorSpacing: 0.42,
  groups: 4,
  arcCount: 26,
  arcSegments: 56,
  arcSpan: [0.3, 0.85],
  // Where a route fades out as it turns behind the globe, as the view-space z of its own direction: gone by the first number, full
  // by the second. The arcs were the one layer with no facing test — the land fades and the flares discard, so only the network kept
  // drawing on the far side, and an additive line with no depth test came out as a lit thread across the black with no ends on it.
  //
  // Wider than the land's own [-0.08, 0.05] on purpose. An arc is lifted `arcLift` off the surface, so it clears the horizon further
  // round than the ground under it does, and cutting it at the land's threshold would take the crown off a route that really does
  // climb over the limb.
  arcFade: [-0.3, -0.04],
  arcLift: 0.11,
  arcSpeed: 0.13,
  arcBase: 0.38,
  // Flares. `period` is the slowest full cycle and each flare takes a random fraction of it, so nothing on screen shares a beat and
  // the appearances read as random. The extras are the ones that are not junctions — scattered over the land so the map itself
  // sparkles, and deliberately unreachable by the cursor or a pillar.
  flareExtra: 16,
  flareSize: 34,
  flarePeriod: 6.5,
  flareRadius: 1.012,
  // The atmosphere. Widths are e-folding distances in globe radii, not exponents — see screenOffset in lib/globe/shaders. The rim is
  // a hot line a little under a hundredth of a radius thick; the haze is the broad depth under it and runs twenty times wider.
  rimWidth: 0.009,
  rimStrength: 1.05,
  rimRadius: 1.008,
  hazeWidth: 0.032,
  hazeStrength: 0.2,
  haloShell: 1.5,
  haloFalloff: 16,
  haloStrength: 0.28,
  // Where the light comes from, in the globe's own space. Above and a little to the left, which puts the brightest part of the rim
  // over the top of the arc rather than evenly around it.
  light: [-0.14, 0.94, 0.31],
  // Fixed seed. The land pose, the anchors and the arcs are all drawn from it, so the composition is identical on every load and can
  // actually be tuned by eye — a fresh random layout every refresh cannot be.
  seed: 0x5eed1a,
};

// The globe is on the brand's own palette, not the reference's.
//
// The reference is blue on navy and the first build copied it, with volt held back for the arcs and flares. That was reversed on
// 2026-08-13: blue was a second accent the site does not have, and it made the hero read as a different product from the rest of the
// page. Everything here is now volt, paper or black — the same three values the mark is built from, which is what lets the globe and
// the letterform be the same particles wearing two shapes.
export const GLOBE_PALETTE = {
  ocean: '#0a0f04',
  oceanEdge: '#000000',
  haze: '#5c7a0c',
  halo: '#4a6209',
  rim: '#d9f56a',
  arc: '#b8e01b',
  arcHead: '#eaffa0',
  flare: '#b8e01b',
  flareCore: '#fdfdfb',
};
