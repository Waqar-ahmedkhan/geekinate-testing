'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Vector2, Vector3 } from 'three';
import { cloudFragment, cloudVertex } from './shaders';
import { readPalette } from './palette';
import { sampleCloud } from '@/lib/shape/cloud';
import { sampleGlyph } from '@/lib/shape/glyph';
import { sampleSnake } from '@/lib/shape/snake';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { COSMOS, LAYOUT } from '@/constants';

const MARK = '/brand/geekinate-mark.svg';
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

const buildGeometry = () => {
  const cloud = sampleCloud(COSMOS.count, { radius: COSMOS.cloudRadius, flatten: COSMOS.cloudFlatten });
  const snake = sampleSnake(COSMOS.count, {
    length: COSMOS.snakeLength,
    radius: COSMOS.snakeRadius,
    flatten: COSMOS.snakeFlatten,
  });
  const random = new Float32Array(COSMOS.count),
    seed = new Float32Array(COSMOS.count),
    tint = new Float32Array(COSMOS.count);
  for (let i = 0; i < COSMOS.count; i += 1) {
    random[i] = Math.random();
    seed[i] = Math.random();
    // How far this particle is lifted off volt toward paper. Zero for most of them, so the mark is the brand colour; squaring the
    // roll on the rest clusters the highlights into patches instead of dusting them evenly over the whole body.
    tint[i] = Math.random() < COSMOS.sparkle ? Math.random() * Math.random() : 0;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(cloud, 3));
  // Seeded with the cloud itself, so before the glyph resolves the morph is the identity and nothing jumps if it never arrives.
  geometry.setAttribute('aGlyph', new BufferAttribute(cloud.slice(), 3));
  geometry.setAttribute('aSnake', new BufferAttribute(snake.points, 3));
  geometry.setAttribute('aArc', new BufferAttribute(snake.arc, 1));
  geometry.setAttribute('aRand', new BufferAttribute(random, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geometry.setAttribute('aTint', new BufferAttribute(tint, 1));
  return geometry;
};

export default function MorphCloud() {
  const material = useRef(null);
  const world = useRef(new Vector3());
  const smooth = useRef(new Vector3(0, 0, 40));
  const trail = useRef(new Vector3(0, 0, 40));
  const attention = useRef(0);
  // The mark's true half-width in world units, filled in once the glyph is rasterised. Seeded at the radius so the first frames
  // under-reach rather than overhang.
  const halfWidth = useRef(COSMOS.glyphRadius);
  const geometry = useMemo(() => buildGeometry(), []);
  const uniforms = useMemo(() => {
    const { paper, volt } = readPalette();
    return {
      uTime: { value: 0 },
      // Assembled at rest, because the hero is the top of the page and the mark is formed there.
      uForm: { value: 1 },
      // 1 is the letterform, 0 the snake. The hero is the top of the page, so the mark starts assembled and lettered.
      uPose: { value: 1 },
      uCrawl: { value: 0 },
      uWaves: { value: COSMOS.snakeWaves },
      uWaveAmp: { value: COSMOS.snakeAmplitude },
      uOffsetX: { value: 0 },
      uTilt: { value: new Vector2() },
      uFaceYaw: { value: 0 },
      uSpread: { value: COSMOS.morphSpread },
      uDrift: { value: COSMOS.driftAmount },
      uDriftLoose: { value: COSMOS.driftLoose },
      uDriftSpeed: { value: COSMOS.driftSpeed },
      uPointer: { value: new Vector3(0, 0, 40) },
      uPointerTrail: { value: new Vector3(0, 0, 40) },
      uPointerActive: { value: 0 },
      uPullRadius: { value: COSMOS.pullRadius },
      uPullStrength: { value: COSMOS.pullStrength },
      uSwirl: { value: COSMOS.swirl },
      uGloss: { value: COSMOS.gloss },
      uBob: { value: 0 },
      uSize: { value: COSMOS.pointSize },
      uScale: { value: 1 },
      uCameraZ: { value: COSMOS.cameraZ },
      uPixelRatio: { value: 1 },
      uPaper: { value: paper },
      uVolt: { value: volt },
      uOpacity: { value: 1 },
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // The letterform is rasterised off the brand SVG on the client, so it lands a frame or several after mount. Writing it straight
  // into the live attribute avoids rebuilding the geometry and keeps every other buffer untouched.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const options = { src: MARK, radius: COSMOS.glyphRadius, depth: COSMOS.glyphDepth, signal: controller.signal };
    sampleGlyph(COSMOS.count, options).then((glyph) => {
      if (cancelled || !glyph) return;
      const attribute = geometry.getAttribute('aGlyph');
      attribute.array.set(glyph.points);
      attribute.needsUpdate = true;
      halfWidth.current = glyph.halfWidth;
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const values = material.current.uniforms;
    const step = Math.min(1, delta * 60);
    const aspect = state.size.width / state.size.height;
    const scale = fitScale(aspect);
    const viewHalf = (VISIBLE_HEIGHT * aspect) / 2;
    values.uTime.value = state.clock.elapsedTime;
    values.uPixelRatio.value = state.gl.getPixelRatio();
    // The whole journey comes off one derived number. `middle` is how far into the body of the page the scroll is: 0 at the top of
    // the hero, 1 anywhere between the hero and the footer, 0 again once the footer has arrived. The two triggers are the only
    // inputs, and multiplying rather than adding them is what makes the middle a plateau instead of a peak.
    const middle = clamp01(stage.heroOut) * (1 - clamp01(stage.footerIn));
    // Pose follows it directly: letterform at both ends, snake in between.
    // Form is the parabola through it — assembled at 0 and 1, fully scattered at the halfway point of each handover. That is what
    // puts the cloud between the two shapes rather than cross-fading them, so the mark never reads as a letter melting into a body.
    const settle = Math.min(1, delta * COSMOS.formLerp);
    stage.pose += (1 - middle - stage.pose) * settle;
    stage.form += (clamp01(1 - 4 * middle * (1 - middle)) - stage.form) * settle;
    values.uPose.value = stage.pose;
    // Scroll drives the crawl, so reversing the scroll crawls the body backwards. The idle term only keeps it breathing when the page
    // is still — without it the snake freezes mid-slither the moment the wheel stops, which reads as a dropped frame.
    values.uCrawl.value = scrollProgress.raw * COSMOS.crawlPerScroll + state.clock.elapsedTime * COSMOS.crawlIdle;
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
    const anchored = anchorOffset(containerHalf - COSMOS.heroEdgeMargin, halfWidth.current * posed);
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

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={cloudVertex}
        fragmentShader={cloudFragment}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
}
