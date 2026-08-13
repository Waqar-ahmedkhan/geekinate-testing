'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { getCloud } from './cloud';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { COSMOS, LAYOUT } from '@/constants';

const HALF_FOV = (COSMOS.cameraFov * Math.PI) / 360;
// The subject plane is at z = 0 and the camera never moves, so this is a constant. Deriving the frame from state.viewport instead
// would tie the scene's size to the camera's distance from the origin and any camera move would feed straight back into it.
const VISIBLE_HEIGHT = 2 * COSMOS.cameraZ * Math.tan(HALF_FOV);

const clamp01 = (value) => Math.min(1, Math.max(0, value));
// A point cloud's silhouette is its extent plus half a particle. The letterform is the widest thing the scene ever holds, and the
// field of view is vertical — width is the axis that fails first, and it only fails at narrow aspect ratios, which a desktop check
// will never catch.
const fitScale = (aspect) => Math.min(1, (VISIBLE_HEIGHT * aspect * 0.4) / COSMOS.glyphRadius);

// Where to put the mark's centre so that its right edge lands on `target`, measured after projection.
//
// Subtracting the half-width is the obvious answer and it is wrong by about 65px at desktop width. The mark is yawed to face the
// camera, which swings its right half *toward* the camera by half-width * sin(yaw) — and a point nearer the camera projects further
// from the centre. So the painted edge overshoots the geometric one by roughly cameraZ / (cameraZ - lift), and the yaw that causes it
// is itself a function of the offset being solved for.
//
// Three fixed-point passes. It converges in two; the third is free insurance and this runs once a frame.
const anchorOffset = (target, markHalf) => {
  let offset = target - markHalf;
  for (let pass = 0; pass < 3; pass += 1) {
    const yaw = -Math.atan2(offset, COSMOS.cameraZ);
    const reach = markHalf * Math.cos(yaw),
      lift = -markHalf * Math.sin(yaw);
    offset = (target * (COSMOS.cameraZ - lift)) / COSMOS.cameraZ - reach;
  }
  return offset;
};

export default function MorphCloud() {
  const material = useRef(null);
  const world = useRef(new Vector3());
  const smooth = useRef(new Vector3(0, 0, 40));
  const trail = useRef(new Vector3(0, 0, 40));
  const attention = useRef(0);
  const ground = useRef(0);
  // getCloud() is called at each use rather than once into a local. The singleton is written to every frame and read during render,
  // and the compiler will not allow one variable to do both — resolving it at the call site keeps each read local to its own scope.
  // The call is a cache hit after the first.
  useFrame((state, delta) => {
    const cloud = getCloud();
    const values = cloud.uniforms;
    const step = Math.min(1, delta * 60);
    const aspect = state.size.width / state.size.height;
    const scale = fitScale(aspect);
    const viewHalf = (VISIBLE_HEIGHT * aspect) / 2;
    values.uTime.value = state.clock.elapsedTime;
    values.uPixelRatio.value = state.gl.getPixelRatio();
    // Ink over the hero's paper wash, paper once the page is back on the void — off the same measurement the substrate paints the
    // wash from, so the mark's shading and the ground under it can never disagree about which one they are on. That measurement is
    // a hard switch, taken the frame the hero leaves the viewport; damping it here means that even if the timing ever slips, the
    // mark crossfades over a few frames instead of snapping.
    ground.current += (1 - stage.light - ground.current) * Math.min(1, delta * 6);
    values.uHighlight.value.lerpColors(cloud.ink, cloud.paper, ground.current);
    // The whole journey comes off one derived number. `middle` is how far into the body of the page the scroll is: 0 at the top of
    // the hero, 1 anywhere between the hero and the footer, 0 again once the footer has arrived. The two triggers are the only
    // inputs, and multiplying rather than adding them is what makes the middle a plateau instead of a peak.
    const middle = clamp01(stage.heroOut) * (1 - clamp01(stage.footerIn));
    // Form is the curve through it — assembled at 0 and 1, fully scattered at the halfway point of each handover. There is only one
    // assembled shape now, so this is the mark coming apart and gathering again rather than a handover between two of them.
    //
    // cos^2, not the parabola 1 - 4m(1 - m) it replaced. Both hit the same three points, but the parabola leaves 1 at a slope of 4:
    // a quarter of the way into the hero's scroll the mark was already four-fifths of the way apart, so however long the trigger
    // range is, the dispersal reads as a burst at the top of it. cos^2 leaves flat at both ends, which spends the same scroll with
    // the letterform still legible for the first part of it and the break-up eased in.
    const settle = Math.min(1, delta * COSMOS.formLerp);
    const held = Math.cos(Math.PI * middle);
    stage.form += (held * held - stage.form) * settle;
    // A bounded swing, not a free rotation, and both halves of that are deliberate.
    //
    // Bounded, because a letterform turned side-on is a sliver. The mark has real thickness now but nothing like its width, so a
    // rotation that passes ninety degrees spends that moment showing almost nothing — the reading of a solid object being turned
    // comes from the range where it is still legible. This swings a little over sixty degrees either way and holds inside it.
    //
    // Both terms are sines rather than anything that accumulates. The first version added `clock * rate` and it drifts without
    // limit: the ends scale the whole angle by `middle`, and a small `middle` against an angle that has been growing for minutes is
    // still a large angle — the mark sat edge-on in the footer, and worse the longer the page had been open.
    const swing = Math.sin(scrollProgress.raw * COSMOS.spinTurns * Math.PI * 2) * COSMOS.spinRange;
    const breathe = Math.sin(state.clock.elapsedTime * COSMOS.spinIdleSpeed) * COSMOS.spinIdle;
    values.uSpin.value = middle * (swing + breathe);
    // `offset` is how much of the hero's pose is still in effect — it drives placement and size together, so the mark grows into the
    // middle of the frame on the way down rather than sliding across it at a fixed size.
    stage.offset += (1 - stage.heroOut - stage.offset) * Math.min(1, delta * COSMOS.formLerp);
    const posed = scale * (1 - stage.offset * (1 - COSMOS.heroScale));
    values.uForm.value = stage.form;
    values.uScale.value = posed;
    // Measured against the hero's container, not the viewport. Past 1440 the copy stops widening and centres, so an offset taken
    // from the viewport keeps pushing the mark right while the column it belongs to stands still — on a wide monitor they end up in
    // different compositions. Below 1440 the two are the same number.
    const containerHalf = viewHalf * Math.min(1, LAYOUT.container / state.size.width);
    // Anchored by its right edge, not by its centre. The brief is that the mark finishes exactly where the navbar's own right edge
    // does, and a centre-and-fraction placement cannot hold that as the mark resizes — the leftover margin changes with every scale.
    // `halfWidth` is the mark's measured extent, not the radius, for the reason spelled out in lib/shape/glyph.
    //
    // Clamped at zero: on a phone the mark is as wide as the frame, there is no room to push it aside, and it centres instead.
    const anchored = anchorOffset(containerHalf - COSMOS.heroEdgeMargin, cloud.halfWidth * posed);
    const offsetX = Math.max(0, anchored) * stage.offset;
    values.uOffsetX.value = offsetX;
    // The angle the mark is seen from, once it has moved off the camera axis. Negative because yawing by -a turns the mark's own +z
    // normal toward -x, which is where the camera is once the mark has gone right.
    values.uFaceYaw.value = -Math.atan2(offsetX, COSMOS.cameraZ);
    if (scrollProgress.reduced) return;
    // The bob rides on the clock, not on the scroll, so the mark keeps breathing while the page is still.
    const clock = state.clock.elapsedTime;
    values.uBob.value = Math.sin(clock * COSMOS.bobSpeed) * COSMOS.bob;
    // The object itself is never transformed, so its local space is world space and the pointer needs no conversion. Both tilt axes
    // are handed to the shader, which applies them about the mark's centre — see the note there.
    // The sway is added to the pointer target rather than applied separately, so the two share one damped value and the mark never
    // fights itself between an idle motion and a cursor it is also following.
    const tilt = values.uTilt.value;
    const swayX = Math.sin(clock * COSMOS.swaySpeed) * COSMOS.sway;
    const swayY = Math.sin(clock * COSMOS.swaySpeed * 0.73 + 1.7) * COSMOS.sway;
    tilt.x += (-pointer.y * COSMOS.tilt + swayX - tilt.x) * COSMOS.tiltLerp * step;
    tilt.y += (pointer.x * COSMOS.tilt + swayY - tilt.y) * COSMOS.tiltLerp * step;
    world.current.set(pointer.x * viewHalf, (pointer.y * VISIBLE_HEIGHT) / 2, 0);
    smooth.current.lerp(world.current, COSMOS.pointerLerp * step);
    // The trail chases the smoothed pointer rather than the raw one, so it is always behind it along the same path. That gap is what
    // the shader smears the particles across.
    trail.current.lerp(smooth.current, COSMOS.pointerTrail * step);
    attention.current += (pointer.active - attention.current) * 0.08 * step;
    values.uPointer.value.copy(smooth.current);
    values.uPointerTrail.value.copy(trail.current);
    values.uPointerActive.value = attention.current;
  });

  return <points geometry={getCloud().geometry} material={getCloud().material} frustumCulled={false} />;
}
