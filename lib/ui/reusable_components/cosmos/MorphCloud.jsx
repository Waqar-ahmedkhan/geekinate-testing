'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';
import { getCloud, wearShape } from './cloud';
import { createGovernor } from './quality';
import { fitGlobe, getGlobe } from '@/lib/globe/scene';
import { coastGlobe, globe } from '@/lib/input/globe';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { measureStage, shapeAnchor, stage } from '@/lib/scroll/stage';
import { CIRCUIT, COSMOS, GLOBE } from '@/constants';

const HALF_FOV = (COSMOS.cameraFov * Math.PI) / 360;
const VISIBLE_HEIGHT = 2 * COSMOS.cameraZ * Math.tan(HALF_FOV);
const HALF_HEIGHT = VISIBLE_HEIGHT / 2;
const FOCUS_REACH = 1.5;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const fitScale = (aspect) => Math.min(1, (VISIBLE_HEIGHT * aspect * 0.4) / COSMOS.glyphRadius);

const PANEL_RAIL = 40;
const rightHalfCentre = (width, viewHalf) => (width < COSMOS.footerSplit ? 0 : (0.5 - PANEL_RAIL / width) * viewHalf);

const nearestAnchor = (anchors, spin, lean, radius, centreY, target) => {
  const cosSpin = Math.cos(spin),
    sinSpin = Math.sin(spin);
  const cosLean = Math.cos(lean),
    sinLean = Math.sin(lean);
  let best = -1,
    closest = FOCUS_REACH * FOCUS_REACH;
  anchors.forEach(({ point, index }) => {
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
  const governor = useRef(createGovernor());
  const wasArriving = useRef(-1);
  const wasOrbiting = useRef(-1);
  const shapeSpot = useRef(new Vector3());
  const shapeScale = useRef(new Vector3(1, 1, 1));
  const shapeEuler = useRef(new Euler());
  const shapeTurn = useRef(new Quaternion());
  const shapeInverse = useRef(new Matrix4());
  const shapeProbe = useRef(new Vector3());
  useFrame((state, delta) => {
    const demoted = governor.current(delta);
    if (demoted) state.setDpr(demoted);
    drawn.current += 1;
    if (drawn.current === 2) onFirstFrame?.();
    measureStage();
    const cloud = getCloud();
    const values = cloud.uniforms;
    const shell = getGlobe();
    const step = Math.min(1, delta * 60);
    const aspect = state.size.width / state.size.height;
    const scale = fitScale(aspect);
    const viewHalf = (VISIBLE_HEIGHT * aspect) / 2;
    values.uTime.value = state.clock.elapsedTime;
    values.uPixelRatio.value = state.gl.getPixelRatio();
    ground.current += (1 - stage.light - ground.current) * Math.min(1, delta * 6);
    values.uHighlight.value.lerpColors(cloud.ink, cloud.paper, ground.current);

    const arriving = clamp01(stage.footerIn) ** COSMOS.formEase;
    const orbiting = 1 - clamp01(stage.heroOut);
    const adopting =
      wasArriving.current < 0 ||
      Math.abs(arriving - wasArriving.current) > COSMOS.adoptJump ||
      Math.abs(orbiting - wasOrbiting.current) > COSMOS.adoptJump;
    wasArriving.current = arriving;
    wasOrbiting.current = orbiting;
    stage.form = adopting ? arriving : stage.form + (arriving - stage.form) * Math.min(1, delta * COSMOS.formLerp);
    stage.globe = adopting ? orbiting : stage.globe + (orbiting - stage.globe) * Math.min(1, delta * COSMOS.globeLerp);
    values.uForm.value = stage.form;
    values.uGlobeMix.value = stage.globe;
    const shaping = Boolean(stage.shape);
    if (shaping) wearShape(cloud, stage.shape);
    stage.shapeMix += ((shaping ? clamp01(stage.shapeIn) : 0) - stage.shapeMix) * Math.min(1, delta * COSMOS.shapeLerp);
    values.uShapeMix.value = stage.shapeMix;
    values.uShapeSolo.value = shaping && stage.shapeIn > 0 ? 1 : 0;
    values.uOpacity.value = stage.hero ? 1 : Math.max(clamp01(stage.footerIn * COSMOS.herolessFade), stage.shapeMix ** 2 * stage.shapeGlow);
    if (shaping) {
      const unit = VISIBLE_HEIGHT / state.size.height;
      const [pitch, yaw, roll] = CIRCUIT.pose;
      const lean = values.uTilt.value;
      shapeSpot.current.set((shapeAnchor.x - state.size.width / 2) * unit, -(shapeAnchor.y - state.size.height / 2) * unit, 0);
      shapeTurn.current.setFromEuler(shapeEuler.current.set(pitch + lean.x, yaw + lean.y, roll));
      shapeScale.current.setScalar((shapeAnchor.size * unit) / CIRCUIT.fit);
      values.uShapeMatrix.value.compose(shapeSpot.current, shapeTurn.current, shapeScale.current);
      const pointSize = (shapeAnchor.size / CIRCUIT.point.reference) * CIRCUIT.point.scale;
      values.uShapeSize.value = Math.min(CIRCUIT.point.max, Math.max(CIRCUIT.point.min, pointSize));
    }
    values.uScale.value = scale;
    const anchor = rightHalfCentre(state.size.width, viewHalf);
    values.uOffsetX.value = anchor * stage.form;
    values.uFaceYaw.value = Math.atan2(anchor, COSMOS.cameraZ) * stage.form;
    values.uSpin.value = Math.sin(state.clock.elapsedTime * COSMOS.spinIdleSpeed) * COSMOS.spinIdle * (1 - stage.form);

    const fit = fitGlobe(aspect);
    const radius = fit.radius * HALF_HEIGHT;
    coastGlobe(delta);
    const spin = state.clock.elapsedTime * GLOBE.spin + globe.angle + clamp01(stage.heroOut) * COSMOS.scrollSpin;
    const centreY = fit.centreY * HALF_HEIGHT - clamp01(stage.heroOut) * COSMOS.scrollSink * radius;
    values.uGlobeRadius.value = radius;
    values.uGlobeY.value = centreY;
    values.uGlobeSpin.value = spin;
    const density = Math.min(1.35, Math.max(0.6, Math.min(state.size.width / 1440, state.size.height / 900)));
    values.uGlobeSize.value = COSMOS.globePoint * density;
    shell.shared.uTime.value = state.clock.elapsedTime;
    shell.shared.uPixelRatio.value = state.gl.getPixelRatio();
    shell.shared.uScale.value = density;
    shell.shared.uOpacity.value = stage.globe;

    if (scrollProgress.reduced) return;
    const clock = state.clock.elapsedTime;
    values.uBob.value = Math.sin(clock * COSMOS.bobSpeed) * COSMOS.bob;
    const tilt = values.uTilt.value;
    const swayX = Math.sin(clock * COSMOS.swaySpeed) * COSMOS.sway;
    const swayY = Math.sin(clock * COSMOS.swaySpeed * 0.73 + 1.7) * COSMOS.sway;
    tilt.x += (-pointer.y * COSMOS.tilt + swayX - tilt.x) * COSMOS.tiltLerp * step;
    tilt.y += (pointer.x * COSMOS.tilt + swayY - tilt.y) * COSMOS.tiltLerp * step;
    world.current.set(pointer.x * viewHalf, (pointer.y * VISIBLE_HEIGHT) / 2, 0);
    smooth.current.lerp(world.current, COSMOS.pointerLerp * step);
    trail.current.lerp(smooth.current, COSMOS.pointerTrail * step);
    attention.current += (pointer.active - attention.current) * 0.08 * step;
    values.uPointer.value.copy(smooth.current);
    values.uPointerTrail.value.copy(trail.current);
    values.uPointerActive.value = attention.current;
    const firing = shaping && stage.shapeMix > 0.85 && pointer.active > 0.5 && clock - values.uShapeFireTime.value > CIRCUIT.fireRest;
    if (firing) {
      const local = shapeProbe.current.copy(world.current).applyMatrix4(shapeInverse.current.copy(values.uShapeMatrix.value).invert());
      if (Math.hypot(local.x, local.y) <= CIRCUIT.fireReach) {
        values.uShapeFireAt.value.set(local.x, local.y, 0);
        values.uShapeFireTime.value = clock;
      }
    }
    const focused =
      stage.globe > 0.4 && pointer.active > 0.5 ? nearestAnchor(shell.anchors, spin, GLOBE.tilt, radius, centreY, world.current) : -1;
    shell.select.uFocus.value = focused;
    shell.select.uPillar.value = stage.globe > 0.4 ? globe.pillar : -1;
  });

  return <points geometry={getCloud().geometry} material={getCloud().material} frustumCulled={false} />;
}
