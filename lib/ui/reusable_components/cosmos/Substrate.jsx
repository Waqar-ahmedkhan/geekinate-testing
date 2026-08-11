'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DataTexture, NearestFilter, RepeatWrapping, RGBAFormat, UnsignedByteType, Vector2 } from 'three';
import { viewFragment, viewVertex } from './substrateShaders';
import { createLife } from './automata';
import { getCloud } from './cloud';
import { readPalette } from './palette';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';
import { COSMOS } from '@/constants';

const HALF_FOV = (COSMOS.cameraFov * Math.PI) / 360;
const VISIBLE_HEIGHT = 2 * COSMOS.cameraZ * Math.tan(HALF_FOV);
// The display plane sits behind everything else the scene draws. Its size comes from the camera's own fov and its distance to that
// plane, never from state.viewport — viewport is measured to the world origin, so anything that moved the camera would feed back into
// the size of the thing that is supposed to cover the frame.
const PLANE_Z = -8;
const PLANE_HEIGHT = 2 * (COSMOS.cameraZ - PLANE_Z) * Math.tan(HALF_FOV);
const TAU = Math.PI * 2;

// Page-scoped machinery, built once. Only things that are never reassigned live here; the texture is rebuilt on resize and so belongs
// to a ref — a value read during render may not have its properties rewritten afterwards.
let cache = null;

const build = () => {
  const { paper, volt } = readPalette();
  return {
    life: createLife(),
    view: {
      uState: { value: null },
      uGrid: { value: new Vector2(1, 1) },
      uOffset: { value: new Vector2() },
      uVolt: { value: volt },
      uPaper: { value: paper },
      uDotSize: { value: COSMOS.dotSize },
      uOpacity: { value: COSMOS.substrateOpacity },
    },
  };
};

const getSubstrate = () => {
  if (!cache) cache = build();
  return cache;
};

// World coordinates to grid coordinates. The display samples the state at `uv + uOffset`, so the stamp has to be written in that same
// shifted frame — which is exactly what makes the wake drift away from the mark instead of sitting under it.
const toGrid = (worldX, worldY, view) => ({
  col: Math.round((0.5 + worldX / (2 * view.viewHalf)) * view.cols),
  row: Math.round((0.5 - worldY / VISIBLE_HEIGHT + view.drift) * view.rows),
});

// The letterform, stamped from the coarse mask rasterised alongside the particles. Walking a 72 x 72 bitmap once a generation costs
// nothing; projecting 26,000 particles individually would cost a great deal more and land in the same cells.
const stampGlyph = (life, cloud, view, posed) => {
  const mask = cloud.mask;
  if (!mask) return;
  const halfWidth = cloud.halfWidth * posed,
    halfHeight = COSMOS.glyphRadius * posed;
  for (let y = 0; y < mask.size; y += 1) {
    for (let x = 0; x < mask.size; x += 1) {
      if (!mask.data[y * mask.size + x]) continue;
      const worldX = view.offsetX + (((x + 0.5) / mask.size) * 2 - 1) * halfWidth;
      const worldY = view.bob + (1 - ((y + 0.5) / mask.size) * 2) * halfHeight;
      const cell = toGrid(worldX, worldY, view);
      life.seed(cell.col, cell.row);
    }
  }
};

// The body, walked along its own arc rather than sampled. It is a straight rod bent by one travelling sine, so for any point down the
// body both the centre and the girth are a formula — the same two the vertex shader uses, which is why the wake lines up with what is
// actually drawn rather than approximating it.
const stampSnake = (life, view, posed, crawl) => {
  const length = COSMOS.snakeLength * posed;
  for (let index = 0; index <= 160; index += 1) {
    const t = index / 160;
    const nose = Math.exp(-((t / 0.05) ** 2)) * 0.92;
    const girth = COSMOS.snakeRadius * posed * Math.max(nose, Math.sin(Math.PI * Math.sqrt(t)) * (1 - t * 0.15));
    const centreX = view.offsetX + Math.sin(t * COSMOS.snakeWaves * TAU - crawl) * COSMOS.snakeAmplitude * posed;
    const cell = toGrid(centreX, view.bob + (t - 0.5) * length, view);
    const spread = Math.ceil((girth / (2 * view.viewHalf)) * view.cols);
    for (let offset = -spread; offset <= spread; offset += 1) life.seed(cell.col + offset, cell.row);
  }
};

export default function Substrate() {
  const plane = useRef(null);
  const clock = useRef(0);
  const store = useRef({ texture: null });

  // getSubstrate() is resolved at each use rather than once into a local: the compiler will not allow one variable to be read during
  // render and written afterwards. The call is a cache hit after the first.
  useFrame((state, delta) => {
    const rig = getSubstrate();
    const cloud = getCloud();
    const cols = Math.max(8, Math.round(state.size.width / COSMOS.cell));
    const rows = Math.max(8, Math.round(state.size.height / COSMOS.cell));
    const grid = store.current;
    plane.current.scale.set(PLANE_HEIGHT * (state.size.width / state.size.height), PLANE_HEIGHT, 1);
    if (rig.life.resize(cols, rows)) {
      grid.texture?.dispose();
      grid.texture = new DataTexture(rig.life.pixels, cols, rows, RGBAFormat, UnsignedByteType);
      grid.texture.minFilter = NearestFilter;
      grid.texture.magFilter = NearestFilter;
      // Repeating at the sampling end matches the wrap the rule already does at its edges, so the lattice can slide past its own
      // bounds without a seam.
      grid.texture.wrapS = RepeatWrapping;
      grid.texture.wrapT = RepeatWrapping;
      grid.texture.needsUpdate = true;
      rig.view.uGrid.value.set(cols, rows);
      rig.view.uState.value = grid.texture;
    }
    // The lattice drifts with the scroll and, more slowly, with the clock — so the wake pulls away from the mark as the page moves,
    // and the field is still travelling when the page is not.
    const drift = scrollProgress.raw * COSMOS.wake + state.clock.elapsedTime * COSMOS.wakeIdle;
    rig.view.uOffset.value.set(0, drift);
    // Fixed generation rate, independent of frame rate. The afterglow covers the gap between generations.
    clock.current += delta;
    const interval = 1 / COSMOS.stepRate;
    if (clock.current < interval) return;
    clock.current %= interval;
    const values = cloud.uniforms;
    const view = {
      cols,
      rows,
      drift,
      viewHalf: (VISIBLE_HEIGHT * (state.size.width / state.size.height)) / 2,
      offsetX: values.uOffsetX.value,
      bob: values.uBob.value,
    };
    // Only an assembled mark leaves a wake. Mid-handover the particles are a loose cloud with no silhouette worth stamping, and
    // seeding off it would smear a rectangle of cells across the page.
    if (stage.form > 0.4) {
      const posed = values.uScale.value;
      if (stage.pose > 0.5) stampGlyph(rig.life, cloud, view, posed);
      else stampSnake(rig.life, view, posed, values.uCrawl.value);
    }
    rig.life.step(COSMOS.decay, COSMOS.spawn);
    grid.texture.needsUpdate = true;
  });

  return (
    <mesh ref={plane} position={[0, 0, PLANE_Z]} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={getSubstrate().view}
        vertexShader={viewVertex}
        fragmentShader={viewFragment}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
