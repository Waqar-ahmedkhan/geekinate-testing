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
// Silhouette, not centreline: the dot cloud's own radius sticks out on every side and is what meets the viewport edge.
const markWidth = gBounds.width + 2 * SNAKE.tubeRadius;
const markHeight = gBounds.height + 2 * SNAKE.tubeRadius;
// Derived from the camera's own fov and its fixed distance to the z=0 plane, deliberately NOT from R3F's `viewport`. That value is
// computed against the camera's distance to the world origin, so once the rig pans the camera it grows — which would scale the
// cloud up, push its centroid further out, pan the camera further, and run away inside a few frames.
const visibleHeight = 2 * Math.tan((SNAKE.cameraFov * Math.PI) / 360) * SNAKE.cameraPosition[2];
const fitScale = (aspect) => Math.min((visibleHeight * aspect * SNAKE.fill) / markWidth, (visibleHeight * SNAKE.fill) / markHeight);
// Derived from the aspect every frame, not a constant. The visible width in world units grows with the aspect ratio, so a fixed
// world offset drifts toward the middle of the frame on wider windows — the mark has to be placed as a fraction of what is seen.
//
// The offset also eases back to centre as the frame narrows. A portrait viewport has no room to hold the mark off to one side: at
// 0.46 aspect the full offset ran it from 49% to 111% of width, hanging off the right edge and crossing the middle at the same
// time. Below `alignNarrowAspect` it is centred, above `alignWideAspect` it is fully offset, and it blends between.
const alignOffset = (aspect) => {
  const settle = Math.min(1, Math.max(0, (aspect - SNAKE.alignNarrowAspect) / (SNAKE.alignWideAspect - SNAKE.alignNarrowAspect)));
  return (SNAKE.alignScreen - 0.5) * settle * visibleHeight * aspect;
};

// Every dot's place in the ribbon, fixed once. Position is recomputed each frame from these, so a dot keeps its identity as the
// window slides — re-randomising per frame would boil the whole cloud instead of carrying it along the spine.
const createDots = (count) => ({
  along: Float32Array.from({ length: count }, () => Math.random()),
  angle: Float32Array.from({ length: count }, () => Math.random() * TAU),
  // sqrt maps a uniform random onto a uniform *area*, which is what fills the volume evenly rather than crowding the axis.
  radius: Float32Array.from({ length: count }, () => Math.sqrt(Math.random())),
  shade: Float32Array.from({ length: count }, () => {
    const [low, high] = SNAKE.dotShadeRange;
    return low + Math.random() * (high - low);
  }),
});

// A frame per spine sample. Dots are scattered symmetrically around the axis, so the frame's roll is invisible and a cross-product
// frame does the job — no Frenet propagation, and none of its flipping.
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

// Everything the frame loop writes to, built once. It lives behind a ref rather than useMemo because every field here is mutated
// in place each frame, and mutating a memo's result is exactly what `react-hooks/immutability` forbids.
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
    // Where the pointer is in the cloud's own space, eased so the gather trails the cursor rather than snapping to it.
    focus: { x: 0, y: 0, strength: 0 },
    ndc: { x: 0, y: 0, active: false },
  };
};

export default function SnakeDots() {
  const cloud = useRef(null);
  const store = useRef(null);
  if (store.current === null) store.current = createStore();

  // Attached here rather than passed as a prop: reading a ref during render is forbidden, and the buffers have to stay the same
  // objects across every frame so the attribute updates land on the geometry the renderer is actually drawing.
  useEffect(() => {
    const built = store.current.geometry;
    cloud.current.geometry = built;
    return () => built.dispose();
  }, []);
  useEffect(() => {
    // R3F's own `state.pointer` is fed by events on the canvas, and the canvas is pointer-events:none so it never intercepts a
    // click or a focus ring. Tracking on the window keeps both: the dots react, the DOM stays reachable.
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
  // State comes off the frame callback rather than useThree so that nothing mutated here was handed out by a hook.
  useFrame(({ camera, size }) => {
    const { geometry, samples, spine, dots, normals, binormals, raycaster, hit, centre, base, accent, focus, ndc } = store.current;
    const gap = scrollProgress.raw - scrollProgress.damped;
    scrollProgress.damped = scrollProgress.reduced ? 0 : scrollProgress.damped + gap * SNAKE.scrollDamping;
    const aspect = size.width / size.height;
    const scale = fitScale(aspect);
    const offsetX = alignOffset(aspect);
    raycaster.setFromCamera(ndc, camera);
    const aimed = ndc.active && raycaster.ray.intersectPlane(GROUND, hit);
    // World to the cloud's own space. The cloud is offset right, so that offset comes back out or the gather lands beside the mark.
    if (aimed) {
      focus.x += ((hit.x - offsetX) / scale - focus.x) * SNAKE.hoverEase;
      focus.y += (hit.y / scale - focus.y) * SNAKE.hoverEase;
    }
    focus.strength += ((aimed ? 1 : 0) - focus.strength) * SNAKE.hoverEase;
    getWindowPoints(spine.curve, scrollProgress.damped, spine.window, samples);
    buildFrames(samples, normals, binormals);
    // Follow the window's centre in y only, and never the head — the head alone whips the frame at every turn, while the centre of
    // mass trails the ribbon and keeps both ends in shot. X is pinned so the mark holds its place on the right of the frame and the
    // travel reads as a straight vertical line. At both ends of the scroll the centre is the letterform's own, so it settles.
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
      {/* Normal blending, not additive: additive light dots over the white sections saturate to nothing. Opaque grains that write
          depth, so the cloud occludes itself and reads as a solid ribbon rather than a glow. */}
      <pointsMaterial vertexColors size={SNAKE.dotSize} sizeAttenuation toneMapped={false} />
    </points>
  );
}
