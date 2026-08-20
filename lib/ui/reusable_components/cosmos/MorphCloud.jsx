'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { getCloud } from './cloud';
import { createGovernor } from './quality';
import { fitGlobe, getGlobe } from '@/lib/globe/scene';
import { coastGlobe, globe } from '@/lib/input/globe';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { COSMOS, GLOBE } from '@/constants';

const HALF_FOV = (COSMOS.cameraFov * Math.PI) / 360;
// The subject plane is at z = 0 and the camera never moves, so this is a constant. Deriving the frame from state.viewport instead
// would tie the scene's size to the camera's distance from the origin and any camera move would feed straight back into it.
const VISIBLE_HEIGHT = 2 * COSMOS.cameraZ * Math.tan(HALF_FOV);
const HALF_HEIGHT = VISIBLE_HEIGHT / 2;
// How near the cursor an anchor has to be, in world units at the subject plane, before the network answers. Wide enough that the
// nearest junction lights without hunting for it, narrow enough that moving the cursor across the globe hands off one at a time.
const FOCUS_REACH = 1.5;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
// A point cloud's silhouette is its extent plus half a particle. The letterform is the widest thing the mark ever holds, and the
// field of view is vertical — width is the axis that fails first, and it only fails at narrow aspect ratios, which a desktop check
// will never catch.
const fitScale = (aspect) => Math.min(1, (VISIBLE_HEIGHT * aspect * 0.4) / COSMOS.glyphRadius);

// The middle of the footer panel's right half, in world units at the subject plane. The panel is inset 16px from the page and
// carries 24px of its own padding, so its content box runs 40px in from each edge of the viewport; the copy holds the left half of
// that box and the mark stands in the centre of the right one. That inset is a pixel measurement rather than a fraction of the
// frame, which is why this takes the width in pixels and not the aspect.
//
// Centred rather than anchored by its right edge. The edge anchor put the letterform hard against the rail with the whole inner side
// of its half empty, so the split read as a column of copy and a mark stuck in the corner rather than as two halves.
const PANEL_RAIL = 40;
const rightHalfCentre = (width, viewHalf) => (0.5 - PANEL_RAIL / width) * viewHalf;

// Which junction the cursor is nearest, or -1 for none.
//
// Walked on the CPU because there are only about fifty of them and the answer is a single uniform. The alternative — a per-particle
// distance test in the shader — would light whatever happened to be closest to each fragment rather than picking one node, which is
// the opposite of what a network firing looks like.
//
// Both the anchor and the pointer are compared after a perspective divide. The lens is long, but the globe is eight world units deep
// and skipping it puts the answer a node out along the limb, which is exactly where the cursor spends most of its time.
const nearestAnchor = (anchors, spin, lean, radius, centreY, target) => {
  const cosSpin = Math.cos(spin),
    sinSpin = Math.sin(spin);
  const cosLean = Math.cos(lean),
    sinLean = Math.sin(lean);
  let best = -1,
    closest = FOCUS_REACH * FOCUS_REACH;
  anchors.forEach(({ point, index }) => {
    // The same pair of rotations the shader applies, in the same order: spin about the sphere's vertical, then the axial lean.
    const spunX = point[0] * cosSpin + point[2] * sinSpin,
      spunZ = point[2] * cosSpin - point[0] * sinSpin;
    const normalZ = spunZ;
    if (normalZ < 0.05) return;
    const normalX = spunX * cosLean - point[1] * sinLean,
      normalY = spunX * sinLean + point[1] * cosLean;
    const depth = COSMOS.cameraZ - normalZ * radius;
    const scale = COSMOS.cameraZ / depth;
    const dx = normalX * radius * scale - target.x,
      dy = (normalY * radius + centreY) * scale - target.y;
    const gap = dx * dx + dy * dy;
    if (gap >= closest) return;
    closest = gap;
    best = index;
  });
  return best;
};

export default function MorphCloud({ onFirstFrame }) {
  const drawn = useRef(0);
  const world = useRef(new Vector3());
  const smooth = useRef(new Vector3(0, 0, 40));
  const trail = useRef(new Vector3(0, 0, 40));
  const attention = useRef(0);
  const ground = useRef(0);
  // One per mount, in a ref rather than at module scope: the governor carries the machine's verdict, and a module singleton would
  // hand a dev remount the previous mount's demotions on top of its own.
  const governor = useRef(createGovernor());
  // getCloud() is called at each use rather than once into a local. The singleton is written to every frame and read during render,
  // and the compiler will not allow one variable to do both — resolving it at the call site keeps each read local to its own scope.
  // The call is a cache hit after the first.
  useFrame((state, delta) => {
    // Before anything else, and off the raw delta: this is the only reading of how the machine is coping, and it has to be taken
    // from the frame that was actually delivered rather than from anything this callback goes on to smooth.
    const demoted = governor.current(delta);
    if (demoted) state.setDpr(demoted);
    // On the second frame, not the first: useFrame runs *before* the render it belongs to, so announcing on frame one would start
    // the stand-in fading against a canvas that is still empty. By the time this callback runs a second time, frame one is on
    // screen and there is something to cross into.
    drawn.current += 1;
    if (drawn.current === 2) onFirstFrame?.();
    const cloud = getCloud();
    const values = cloud.uniforms;
    const shell = getGlobe();
    const step = Math.min(1, delta * 60);
    const aspect = state.size.width / state.size.height;
    const scale = fitScale(aspect);
    const viewHalf = (VISIBLE_HEIGHT * aspect) / 2;
    values.uTime.value = state.clock.elapsedTime;
    values.uPixelRatio.value = state.gl.getPixelRatio();
    // Paper highlights on the void. `stage.light` used to flip this to ink wherever the mark was over the white hero; the hero is
    // dark and the mark is only ever seen over it and the footer, so the flag is a constant. The damping stays: it costs one lerp
    // and it is what would keep a future light surface from snapping the shading between frames.
    ground.current += (1 - stage.light - ground.current) * Math.min(1, delta * 6);
    values.uHighlight.value.lerpColors(cloud.ink, cloud.paper, ground.current);

    // The page in two numbers, and they no longer interact. `heroOut` runs 0 to 1 as the globe's section scrolls away and `footerIn`
    // 0 to 1 as the footer arrives; the scattered cloud is simply what is left when neither pose is claimed.
    //
    // This replaced a single `middle` progress that multiplied the two together and drove one form curve. That construction was
    // right when the letterform was the only shape and had to be assembled at both ends of the page — with the globe holding the
    // hero it left the mark *assembling* underneath exactly as the world came apart, so the globe morphed into a G in mid-air.
    // Linear, and both curves this replaced were wrong at one end. Smoothstep is symmetric and sits at 0.82 by three quarters of the
    // scroll, which on top of the shader's stagger put a finished letterform on screen with a quarter of the footer still to come.
    // x² fixed that ending and broke the opening instead: it is under 0.1 for the first third, so the cloud visibly does not move
    // while the panel is arriving and then assembles all at once near the foot of the page.
    //
    // Straight through is what the gesture actually is. The stagger in the shader is the easing — `morphSpread` gives every particle
    // its own slice of this range, so the mark gathers over the whole of it rather than stepping between two states, and a curve on
    // top of that only decides which part of the scroll the gathering is crowded into. Nothing needs it crowded.
    const settle = Math.min(1, delta * COSMOS.formLerp);
    const arriving = clamp01(stage.footerIn);
    stage.form += (arriving - stage.form) * settle;
    stage.globe += (1 - clamp01(stage.heroOut) - stage.globe) * Math.min(1, delta * COSMOS.globeLerp);
    values.uForm.value = stage.form;
    values.uGlobeMix.value = stage.globe;
    values.uScale.value = scale;
    // The letterform holds the right half of the footer and the copy holds the left, so the mark is moved out to the middle of that
    // half rather than left on the camera axis. uFaceYaw is the correction that goes with the offset, not an effect: a flat mark
    // parked off the axis is seen at an angle and its own depth shears sideways under perspective, and yawing it back puts that
    // depth along the view ray.
    //
    // Both are scaled by `stage.form`, because this buffer is also the scattered pose. Applied flat, the offset would drag the whole
    // mid-page cloud to the right along with the letterform it becomes.
    const anchor = rightHalfCentre(state.size.width, viewHalf);
    values.uOffsetX.value = anchor * stage.form;
    values.uFaceYaw.value = Math.atan2(anchor, COSMOS.cameraZ) * stage.form;
    values.uSpin.value = Math.sin(state.clock.elapsedTime * COSMOS.spinIdleSpeed) * COSMOS.spinIdle * (1 - stage.form);

    // The globe's frame, solved from the viewport and published on the cloud's own uniforms — which is also where the shells read it
    // from, so the world and the shells around it cannot disagree about where the world is. See GlobeShell.
    const fit = fitGlobe(aspect);
    const radius = fit.radius * HALF_HEIGHT;
    coastGlobe(delta);
    // Three sources of turn on one axis: the slow idle, whatever the reader has dragged, and the scroll running it on as the hero
    // leaves. The scroll term is what stops the exit reading as the globe being slid off screen — it leaves under its own power.
    const spin = state.clock.elapsedTime * GLOBE.spin + globe.angle + clamp01(stage.heroOut) * COSMOS.scrollSpin;
    const centreY = fit.centreY * HALF_HEIGHT - clamp01(stage.heroOut) * COSMOS.scrollSink * radius;
    values.uGlobeRadius.value = radius;
    values.uGlobeY.value = centreY;
    values.uGlobeSpin.value = spin;
    // The land is sized against the viewport rather than left at a fixed pixel size: the globe's own radius in pixels tracks the
    // frame, so a constant dot is a solid crust on a phone and a scatter of specks on a 4K monitor.
    const density = Math.min(1.35, Math.max(0.6, Math.min(state.size.width / 1440, state.size.height / 900)));
    values.uGlobeSize.value = COSMOS.globePoint * density;
    shell.shared.uTime.value = state.clock.elapsedTime;
    shell.shared.uPixelRatio.value = state.gl.getPixelRatio();
    shell.shared.uScale.value = density;
    shell.shared.uOpacity.value = stage.globe;

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
    // Off the raw pointer, not the damped one. The lift and the comet want to lag the cursor because they are made of matter; the
    // node the cursor is *pointing at* is a selection, and a selection that eases into place reads as the page being slow.
    const focused =
      stage.globe > 0.4 && pointer.active > 0.5 ? nearestAnchor(shell.anchors, spin, GLOBE.tilt, radius, centreY, world.current) : -1;
    shell.select.uFocus.value = focused;
    shell.select.uPillar.value = stage.globe > 0.4 ? globe.pillar : -1;
  });

  return <points geometry={getCloud().geometry} material={getCloud().material} frustumCulled={false} />;
}
