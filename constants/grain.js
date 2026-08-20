// Every tunable for the cursor wake — the grain the pointer sheds while it is over a paper section. Held here for the same reason
// COSMOS is: the loop that reads them should read as behaviour, not as a pile of floats.
//
// Distances are CSS pixels and times are seconds. Nothing in here is world space: this layer is a plain 2D canvas over the page, not
// part of the particle scene, so it never has to agree with the camera.
export const GRAIN = {
  // The pool is allocated once at mount and never grows. A bead's life is `life` seconds and emission is capped at `emitPerFrame`,
  // so the most that can ever be alive at 60fps is emitPerFrame * 60 * life — 260 for the wake at full tilt, and the ring can be
  // laying another 121 on top of that if the reader is scrolling while they move the mouse. The slack above their sum is what
  // absorbs a frame-rate spike without the ring buffer eating beads that are still on screen.
  count: 460,
  // Emission is driven by distance travelled, not by time. A cursor resting on a card sheds nothing; a flick across the work grid
  // sheds a long wake. Time-driven emission does the opposite of what the effect is for — it piles grain under a stationary pointer
  // and thins it out exactly when the movement is worth drawing.
  emitPerPixel: 0.3,
  emitPerFrame: 7,
  // A frame where the cursor appears to jump — a tab return, a dropped frame, an anchor link — must not spend the whole budget in
  // one place. Travel beyond this is treated as a teleport and sheds nothing. It has to clear a hard scroll fling, which moves the
  // page about 70px under the cursor in a frame, or flinging the page would be the one gesture that produced no grain at all.
  travelCap: 180,
  // How far off the cursor a bead starts, so the wake has width rather than being a single-pixel thread.
  jitter: 3,
  // The share of the pointer's own velocity a bead keeps. Low: the grain is meant to be shed and left behind, not thrown. At 0.18 a
  // normal move launches a bead about 30px before the drag has taken it, which is roughly one card's border away.
  inherit: 0.18,
  spread: 26,
  drag: 3.4,
  // A slow settle. Grain that only decelerates reads as sparks stopping in mid-air; a little downward drift reads as dust.
  sink: 34,
  life: 0.62,
  lifeSpread: 0.35,
  size: 3.4,
  sizeSpread: 0.55,
  sizeDecay: 0.55,
  // The share of a bead's life spent arriving. Short, because a bead that fades *in* slowly reads as a lag between the cursor and
  // the effect — the wake has to exist at the moment the cursor passes and take its time only on the way out.
  fadeIn: 0.09,
  alpha: 0.72,
  // Volt is the only accent this site has, and a wake made entirely of it would be a green trail rather than grain with a brand hit
  // in it. The rest is ink: the paper sections are white, so the grain is dark there for the same reason the additive dot cloud had
  // to stop being paper-white — a light particle on a light ground is not a subtle particle, it is an absent one.
  voltShare: 0.22,
  // The bead is baked once into an offscreen canvas and blitted, rather than being a path per particle per frame. A radial gradient
  // costs about the same as a fill on its own and forty times that at 300 of them a frame.
  spriteSize: 16,
  // The layer is 300 scaled blits of a small sprite, so it is not fill-rate bound the way the WebGL scene is — but it is composited
  // over a live page on every frame it draws, and there is nothing on a bead of grain that a third device pixel would show.
  maxDpr: 2,
  // Below this the ring is treated as absent. Chasing an exponential all the way to zero costs a full pass over the pool every
  // frame forever, for a difference no display can show.
  gone: 0.004,
  // The scroll ring ---------------------------------------------------------------------------------------------------------
  // What the wake does when the page moves instead of the cursor. Same beads, same pool, same material — while the page is
  // scrolling they are laid onto a circle around the cursor and steered around it, and when it stops the steering simply switches
  // off and the drag and the sink that were always there take the ring apart.
  //
  // **Nothing here draws a circle.** There is no stroke, no arc and no radius on screen; there is a radius that particles are asked
  // to sit near. A drawn ring was built first and rejected on sight — it read as a progress dial bolted onto the cursor rather than
  // as the page's own grain answering the scroll, which is the whole point of building it out of the beads that were already there.
  ringRadius: 34,
  // Emission is per second here rather than per pixel, because the gesture being answered has no pixels in it: the cursor is not
  // moving. This is the one thing the distance-driven emitter cannot express.
  ringPerSecond: 130,
  ringJitter: 2.5,
  // Tangential speed in px/s — about a fifth of a turn a second at the radius above. Enough to read as orbiting, slow enough that
  // the ring is not a spinner.
  ringOrbit: 55,
  // How hard a bead off the radius is steered back onto it, in px/s per px of error. The radial and tangential terms are one target
  // velocity rather than two forces, which is what keeps a bead from oscillating through the ring it is trying to join.
  ringPull: 3.2,
  // How fast a bead's own velocity is steered toward that target, per second. It is applied after the drag, so the drag no longer
  // fights it and the orbit runs at its nominal speed instead of two thirds of it.
  ringGrip: 8,
  // Ring beads outlive wake beads. A wake should be gone by the time the eye has followed it; a ring has to still be there while it
  // is being looked at.
  ringLife: 1.5,
  // In fast, out slow, and a hold in front of both. Smooth scrolling arrives in bursts with real gaps in them, and without the hold
  // the ring comes apart and reforms once per wheel notch.
  ringRise: 12,
  ringFall: 4.2,
  ringHoldMs: 180,
};
