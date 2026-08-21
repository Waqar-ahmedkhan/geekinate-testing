'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Color, Plane, Raycaster, Vector3 } from 'three';
import { gBounds } from '@/lib/curve/gCurve';
import { createMasterSpine, getWindowPoints } from '@/lib/curve/masterSpine';
import { scrollProgress } from '@/lib/scroll/progress';
import { SNAKE } from '@/constants';

const TAU = Math.PI * 2;
const UP = new Vector3(0, 0, 1);
const ASIDE = new Vector3(0, 1, 0);
const GROUND = new Plane(new Vector3(0, 0, 1), 0);
const markWidth = gBounds.width + 2 * SNAKE.tubeRadius;
const markHeight = gBounds.height + 2 * SNAKE.tubeRadius;
const visibleHeight = 2 * Math.tan((SNAKE.cameraFov * Math.PI) / 360) * SNAKE.cameraPosition[2];
const fitScale = (aspect) => Math.min((visibleHeight * aspect * SNAKE.fill) / markWidth, (visibleHeight * SNAKE.fill) / markHeight);
const alignOffset = (aspect) => {
  const settle = Math.min(1, Math.max(0, (aspect - SNAKE.alignNarrowAspect) / (SNAKE.alignWideAspect - SNAKE.alignNarrowAspect)));
  return (SNAKE.alignScreen - 0.5) * settle * visibleHeight * aspect;
};

const createDots = (count) => ({
  along: Float32Array.from({ length: count }, () => Math.random()),
  angle: Float32Array.from({ length: count }, () => Math.random() * TAU),
  radius: Float32Array.from({ length: count }, () => Math.sqrt(Math.random())),
  shade: Float32Array.from({ length: count }, () => {
    const [low, high] = SNAKE.dotShadeRange;
    return low + Math.random() * (high - low);
  }),
});

const buildFrames = (points, normals, binormals) =>
  points.forEach((point, index) => {
    const next = points[Math.min(index + 1, points.length - 1)];
    const previous = points[Math.max(index - 1, 0)];
    const tangent = next.clone().sub(previous);
    if (tangent.lengthSq() === 0) tangent.copy(UP);
    tangent.normalize();
    const reference = Math.abs(tangent.dot(UP)) > 0.99 ? ASIDE : UP;
    normals[index].crossVectors(tangent, reference).normalize();
    binormals[index].crossVectors(tangent, normals[index]).normalize();
  });

const createStore = () => {
  const geometry = new BufferGeometry();
  const samples = Array.from({ length: SNAKE.spineSamples }, () => new Vector3());
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(SNAKE.dotCount * 3), 3));
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(SNAKE.dotCount * 3), 3));
  geometry.boundingSphere = null;
  return {
    geometry,
    samples,
    spine: createMasterSpine(),
    dots: createDots(SNAKE.dotCount),
    normals: samples.map(() => new Vector3()),
    binormals: samples.map(() => new Vector3()),
    raycaster: new Raycaster(),
    hit: new Vector3(),
    centre: new Vector3(),
    base: new Color(SNAKE.dotColor),
    accent: new Color(SNAKE.hoverColor),
    focus: { x: 0, y: 0, strength: 0 },
    ndc: { x: 0, y: 0, active: false },
  };
};

export default function SnakeDots() {
  const cloud = useRef(null);
  const store = useRef(null);
  if (store.current === null) store.current = createStore();

  useEffect(() => {
    const built = store.current.geometry;
    cloud.current.geometry = built;
    return () => built.dispose();
  }, []);
  useEffect(() => {
    const { ndc } = store.current;
    const track = ({ clientX, clientY }) => {
      ndc.x = (clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(clientY / window.innerHeight) * 2 + 1;
      ndc.active = true;
    };
    const release = () => {
      ndc.active = false;
    };
    window.addEventListener('pointermove', track, { passive: true });
    document.addEventListener('pointerleave', release);
    return () => {
      window.removeEventListener('pointermove', track);
      document.removeEventListener('pointerleave', release);
    };
  }, []);
  useFrame(({ camera, size }) => {
    const { geometry, samples, spine, dots, normals, binormals, raycaster, hit, centre, base, accent, focus, ndc } = store.current;
    const gap = scrollProgress.raw - scrollProgress.damped;
    scrollProgress.damped = scrollProgress.reduced ? 0 : scrollProgress.damped + gap * SNAKE.scrollDamping;
    const aspect = size.width / size.height;
    const scale = fitScale(aspect);
    const offsetX = alignOffset(aspect);
    raycaster.setFromCamera(ndc, camera);
    const aimed = ndc.active && raycaster.ray.intersectPlane(GROUND, hit);
    if (aimed) {
      focus.x += ((hit.x - offsetX) / scale - focus.x) * SNAKE.hoverEase;
      focus.y += (hit.y / scale - focus.y) * SNAKE.hoverEase;
    }
    focus.strength += ((aimed ? 1 : 0) - focus.strength) * SNAKE.hoverEase;
    getWindowPoints(spine.curve, scrollProgress.damped, spine.window, samples);
    buildFrames(samples, normals, binormals);
    centre.set(0, 0, 0);
    samples.forEach((sample) => centre.add(sample));
    centre.divideScalar(samples.length);
    camera.position.y += (centre.y * scale - camera.position.y) * SNAKE.cameraFollow;
    cloud.current.position.x = offsetX;
    const position = geometry.attributes.position.array;
    const colour = geometry.attributes.color.array;
    const last = samples.length - 1;
    const reach = SNAKE.hoverRadius * SNAKE.hoverRadius;
    dots.along.forEach((along, index) => {
      const slot = along * last;
      const step = Math.min(Math.floor(slot), last - 1);
      const blend = slot - step;
      const from = samples[step],
        to = samples[step + 1];
      const normal = normals[step],
        binormal = binormals[step];
      const offset = dots.radius[index] * SNAKE.tubeRadius;
      const across = Math.cos(dots.angle[index]) * offset,
        around = Math.sin(dots.angle[index]) * offset;
      let x = from.x + (to.x - from.x) * blend + normal.x * across + binormal.x * around;
      let y = from.y + (to.y - from.y) * blend + normal.y * across + binormal.y * around;
      const z = from.z + (to.z - from.z) * blend + normal.z * across + binormal.z * around;
      const dx = focus.x - x,
        dy = focus.y - y;
      const distance = dx * dx + dy * dy;
      const grip = distance < reach ? (1 - distance / reach) * focus.strength : 0;
      x += dx * grip * SNAKE.hoverPull;
      y += dy * grip * SNAKE.hoverPull;
      const cursor = index * 3;
      position[cursor] = x;
      position[cursor + 1] = y;
      position[cursor + 2] = z;
      const shade = dots.shade[index];
      colour[cursor] = base.r * shade + (accent.r - base.r * shade) * grip;
      colour[cursor + 1] = base.g * shade + (accent.g - base.g * shade) * grip;
      colour[cursor + 2] = base.b * shade + (accent.b - base.b * shade) * grip;
    });
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    cloud.current.scale.setScalar(scale);
  });
  return (
    <points ref={cloud} frustumCulled={false}>
      <pointsMaterial vertexColors size={SNAKE.dotSize} sizeAttenuation toneMapped={false} />
    </points>
  );
}
