// Every tunable the 3D mark reads. Phase 1 covers the static letterform only — the journey curve, the sliding window, the taper and
// the post-processing chain each arrive with their own phase and will add their own blocks here rather than scattering numbers
// through the scene.
//
// Units are the normalised space that scripts/sample-g-path.mjs bakes: the letterform sits in a unit box around the origin, so a
// radius of 0.085 is 8.5% of the mark's longer side. The glyph's own stroke half-width normalises to 0.1007; the tube runs lighter
// than that because a round section reads heavier than a flat one at matching width, and because the bar tip has to clear the
// right-hand run. Clearance between those two centrelines is 0.18203, so any radius at or above 0.091 closes the bowl's aperture —
// which is the opening the head has to travel out through from Phase 2 onward.
export const SNAKE = {
  // Letterform. A perfectly flat ribbon reads as a sticker under studio light, so the spine carries a shallow sine in Z.
  waveDepth: 0.04,
  waveCycles: 1.5,
  // Fraction of the viewport the mark is allowed to occupy on its tighter axis. Scale is derived from this rather than fixed: the
  // camera's field of view is vertical, so a fixed scale that frames well on a laptop runs off both edges of a phone. The
  // silhouette is the centreline bounds grown by the tube radius on every side, which is why the fit reads tubeRadius too.
  //
  // Sized by a horizontal squeeze, not by taste. The spine spans about 1.43 in local units from the tail's lead to the head's, and
  // the whole of that has to fit inside the right-hand band of the frame — which at this camera is 0.283 of screen width per unit
  // of scale. Holding the band to roughly 67%..95% therefore caps scale near 1.02, and this is the fill that produces it. It buys
  // the left of the hero for copy at the same time.
  fill: 0.375,
  // Journey — Region B, the path between leaving the letterform and rejoining it. A straight vertical descent held on the right of
  // the frame: the head turns down out of the bottom line, runs down in a line, then returns to the tail on a far negative Z so the
  // return leg reads as a distant thread rather than a second bar climbing back up.
  //
  // Every value here was chosen against a measurement, not by eye. Turn rate is degrees per unit of arc; the letterform's own
  // corners run at about 410 and are the ceiling, because those corners are what the mark already reads correctly through. Two
  // things drive it. Uneven control-point spacing: a Catmull-Rom answers a spacing jump with a curvature spike, so no two
  // consecutive gaps here differ by more than 2x. And out-and-back extremities: the first waypoint used to be the sharpest vertex
  // on the spine at 2734, so it is chamfered into two gentler ones. The journey now peaks at 367.
  // The head leaves the bar tip heading +x, so the descent falls straight down the right of the frame without ever crossing the
  // middle. The return leg rides back up behind it on a deep negative z and only reaches toward the centre at the very end, where
  // it has to: the tail is entered along the bottom bar's own +x tangent, so the approach is necessarily from its left.
  //
  // Spacing between consecutive points stays within about 1.6x throughout, including into both leads. That is not cosmetic — a
  // Catmull-Rom answers a spacing jump with a curvature spike, and an 8x jump into the tail lead once drove that join to 919
  // degrees per unit with a radius of curvature under the ribbon's own, which self-intersects.
  // 0.45 is the shortest lead that still joins cleanly at both ends. Shorter was tried to keep the return leg off the frame's
  // centre and it forced a hairpin instead: both joins hit ~950 degrees per unit with a radius of 0.060, under the ribbon's own
  // 0.085, which self-intersects. The horizontal budget is resolved by `fill` and `alignX` below, not by starving the lead.
  journeyLead: 0.45,
  journeyLeadTail: 0.3,
  journey: [
    { id: 'turn-down', position: [0.55, -0.9, -0.1] },
    { id: 'descend', position: [0.5, -2.1, -0.3] },
    { id: 'descend-far', position: [0.45, -3.4, -0.55] },
    { id: 'descend-out', position: [0.38, -4.6, -0.85] },
    // The turn at the foot of the descent takes its room in y and z, not x. Widening it sideways is what would push the return leg
    // back toward the middle of the frame; squeezing it collapsed the radius to 0.048, under the ribbon's own 0.085.
    { id: 'bottom', position: [0.12, -5.65, -1.35] },
    { id: 'swing-behind', position: [-0.16, -4.7, -1.75] },
    // The return rides shallow, not deep. At z -2 it measured a comfortable world x and still projected to 66% of screen width,
    // because the frustum widens with distance. Bringing it toward the camera plane is what actually moves it right on screen.
    { id: 'rise-behind', position: [-0.26, -3.2, -1.35] },
    { id: 'rise-mid', position: [-0.3, -1.95, -0.85] },
    // The last three ramp the spacing down into the tail's short lead. Dropping straight from a 1.2-long stride onto a 0.3 lead is
    // what put that join at 986 with a radius of 0.058, under the ribbon's own — the same spacing-jump failure as every other time.
    { id: 'rise-in', position: [-0.42, -1.35, -0.55] },
    { id: 'return', position: [-0.52, -0.88, -0.32] },
    { id: 'settle', position: [-0.66, -0.6, -0.12] },
  ],
  // Where the mark sits across the frame, as a fraction of viewport width. 0.5 is centred, 1 is the right edge.
  //
  // Deliberately a screen fraction rather than a world offset, and the distinction is the whole story. A fixed world offset lands
  // at a different place on every aspect ratio, because a wider frame is wider in world units too: 0.62 world units read as 80% of
  // width on a 16:10 laptop and 72% on a 2.3:1 window, which is why this kept measuring correct and looking centred.
  //
  // Judge it in screen fractions for the same reason depth matters here — the frustum widens with distance, so anything behind the
  // camera plane projects toward the middle of the frame however far right it sits in world units.
  alignScreen: 0.8,
  alignNarrowAspect: 0.9,
  alignWideAspect: 1.5,
  // Window and scroll. `windowSlack` multiplies the letterform's arc length: at 1 the window is exactly the mark, and anything
  // below it means the G never looks complete at either end. `scrollLerp` is Lenis's own smoothing; `scrollDamping` is the second,
  // slower follow applied inside useFrame, and it is what makes the motion read as weight rather than twitch.
  windowSlack: 1,
  scrollLerp: 0.1,
  scrollDamping: 0.1,
  arcLengthDivisions: 4000,
  // Below this change in damped progress the window has not moved enough to be worth rebuilding the geometry for.
  progressEpsilon: 0.00002,
  // Ribbon. `tubeRadius` no longer builds a tube — it is the radius of the volume the dots fill, so the mark still reads at the
  // logo's own weight. `spineSamples` is how many points of the window get evaluated per frame; the dots interpolate between them,
  // so this can be far lower than the dot count without showing.
  tubeRadius: 0.085,
  spineSamples: 220,
  // Dots. Radius is sqrt-distributed because a uniform random radius crowds the axis and leaves the surface bare — the mark ends
  // up looking like a wire with fluff on it rather than a solid ribbon of particles.
  dotCount: 18000,
  dotSize: 0.013,
  // Narrow, because shade multiplies the colour: taken too low, volt turns to a muddy olive that dies against the black hero.
  dotShadeRange: [0.72, 1],
  // Pointer. Dots inside `hoverRadius` are pulled toward the cursor by up to `hoverPull` of the remaining distance and tinted
  // toward volt. Measured off the reference, which gathers and brightens rather than repelling.
  hoverRadius: 0.42,
  hoverPull: 0.45,
  hoverEase: 0.12,
  // Colour. Volt, because the mark has to stay legible on both the black hero and the white sections it travels across, and volt
  // is the one palette token with enough contrast against either. Paper dots were tried first and are invisible over white ground.
  //
  // That choice also fixes the blending mode: additively blended light dots on white saturate to nothing, so these draw with
  // normal blending and write depth, which reads as solid grains rather than glow. The hover tint goes to paper, which flares
  // against the hero where the pointer mostly lives; over light sections the gather still reads through density alone.
  dotColor: '#b8e01b',
  hoverColor: '#fdfdfb',
  // Camera. Head-on, framing the mark at roughly 63% of viewport height at this field of view.
  //
  // It pans in **y only**, following the window's centre. The window is a fixed 3.14 of arc, so for the ribbon to stop reading as
  // the letterform the journey has to be several times that — and folding that much arc into one viewport forces near-cusps
  // (bounded journeys measured 5400 to 13400 degrees per unit against the letterform's 410). Letting the descent use the height it
  // needs and tracking it vertically resolves that. X is deliberately pinned: the mark holds its place on the right of the frame,
  // so the only motion is straight up and down.
  cameraPosition: [0, 0, 4.6],
  cameraFov: 38,
  cameraFollow: 0.055,
  // Canvas. Points are unlit, so there is no environment, no lights and no post-processing chain to pay for.
  dpr: [1, 1.75],
};
