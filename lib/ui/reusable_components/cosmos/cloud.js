import { BufferAttribute, BufferGeometry, Matrix4, ShaderMaterial, Vector2, Vector3 } from 'three';
import { cloudFragment, cloudVertex } from './shaders';
import { readPalette } from './palette';
import { computeCloud, computeShapes } from './shapes';
import { getGlobe, globePose } from '@/lib/globe/scene';
import { seeded } from '@/lib/globe/sphere';
import { sampleCircuit } from '@/lib/shape/circuit';
import { footprint } from '@/lib/shape/footprint';
import { sampleGlyph } from '@/lib/shape/glyph';
import { nextTask } from '@/lib/utils';
import { COSMOS, GLOBE } from '@/constants';

const MARK = '/brand/geekinate-mark.svg';
const SHAPES = { circuit: sampleCircuit };

let cache = null;

const buildGeometry = (cloud) => {
  const random = new Float32Array(COSMOS.count),
    seed = new Float32Array(COSMOS.count),
    tint = new Float32Array(COSMOS.count);
  const draw = seeded(COSMOS.seed + 1);
  for (let i = 0; i < COSMOS.count; i += 1) {
    random[i] = draw();
    seed[i] = draw();
    tint[i] = draw() < COSMOS.sparkle ? draw() * draw() : 0;
  }
  const normals = new Float32Array(COSMOS.count * 3);
  for (let i = 0; i < COSMOS.count; i += 1) normals[i * 3 + 2] = 1;
  const mark = new Float32Array(COSMOS.count);
  for (let i = 0; i < COSMOS.glyphCount; i += 1) mark[i] = 1;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(cloud, 3));
  geometry.setAttribute('aGlyph', new BufferAttribute(cloud.slice(), 3));
  geometry.setAttribute('aGlobe', new BufferAttribute(globePose(), 3));
  geometry.setAttribute('aNormal', new BufferAttribute(normals, 3));
  geometry.setAttribute('aMark', new BufferAttribute(mark, 1));
  geometry.setAttribute('aRand', new BufferAttribute(random, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geometry.setAttribute('aTint', new BufferAttribute(tint, 1));
  geometry.setAttribute('aShape', new BufferAttribute(new Float32Array(COSMOS.count * 3), 3));
  geometry.setAttribute('aShapeNormal', new BufferAttribute(new Float32Array(COSMOS.count * 3), 3));
  geometry.setAttribute('aShapeData', new BufferAttribute(new Float32Array(COSMOS.count * 4), 4));
  return geometry;
};

const buildUniforms = (paper, volt, ink) => ({
  uTime: { value: 0 },
  uForm: { value: 1 },
  uSpin: { value: 0 },
  uOffsetX: { value: 0 },
  uOffsetY: { value: 0 },
  uBob: { value: 0 },
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
  uSize: { value: COSMOS.pointSize },
  uScale: { value: 1 },
  uCameraZ: { value: COSMOS.cameraZ },
  uPixelRatio: { value: 1 },
  uHighlight: { value: paper.clone() },
  uVolt: { value: volt },
  uShade: { value: volt.clone().lerp(ink, COSMOS.shadeDepth) },
  uSheen: { value: volt.clone().lerp(paper, COSMOS.sheenLift) },
  uCore: { value: COSMOS.beadCore },
  uGloss: { value: COSMOS.gloss },
  uOpacity: { value: 1 },
  uGlobeMix: { value: 1 },
  uGlobeRadius: { value: 1 },
  uGlobeY: { value: 0 },
  uGlobeSpin: { value: 0 },
  uGlobeTilt: { value: GLOBE.tilt },
  uGlobeSize: { value: COSMOS.globePoint },
  uGlobeFade: { value: new Vector2(COSMOS.globeFadeIn, COSMOS.globeFadeOut) },
  uLift: { value: COSMOS.globeLift },
  uLiftRadius: { value: COSMOS.globeLiftRadius },
  uShapeMix: { value: 0 },
  uShapeSolo: { value: 0 },
  uShapeMatrix: { value: new Matrix4() },
  uShapeSize: { value: COSMOS.pointSize },
  uShapeFireAt: { value: new Vector3(0, 0, 50) },
  uShapeFireTime: { value: -100 },
});

const loadGlyph = (entry) => {
  sampleGlyph(COSMOS.glyphCount, {
    src: MARK,
    radius: COSMOS.glyphRadius,
    depth: COSMOS.glyphDepth,
    frayed: COSMOS.glyphFray,
  }).then((glyph) => {
    if (!glyph) return;
    const attribute = entry.geometry.getAttribute('aGlyph'),
      normal = entry.geometry.getAttribute('aNormal');
    attribute.array.set(glyph.points);
    attribute.needsUpdate = true;
    normal.array.set(glyph.normals);
    normal.needsUpdate = true;
    entry.halfWidth = glyph.halfWidth;
    footprint.mask = glyph.mask;
  });
};

export function wearShape(entry, name) {
  if (entry.shape === name || !SHAPES[name]) return;
  const { positions, normals, data } = SHAPES[name](COSMOS.count);
  [
    ['aShape', positions],
    ['aShapeNormal', normals],
    ['aShapeData', data],
  ].forEach(([key, values]) => {
    const attribute = entry.geometry.getAttribute(key);
    attribute.array.set(values);
    attribute.needsUpdate = true;
  });
  entry.shape = name;
}

const shapesOffThread = () =>
  new Promise((resolve) => {
    if (typeof Worker === 'undefined') {
      resolve(computeShapes());
      return;
    }
    const worker = new Worker(new URL('./shapes.worker.js', import.meta.url));
    const finish = (shapes) => {
      worker.terminate();
      resolve(shapes);
    };
    worker.onmessage = ({ data }) => finish(data);
    worker.onerror = () => finish(computeShapes());
    worker.postMessage(null);
  });

export async function prepareCloud() {
  const { globe, cloud } = await shapesOffThread();
  getGlobe(globe);
  await nextTask();
  getCloud(cloud);
}

export function getCloud(cloud) {
  if (cache) return cache;
  const { paper, volt, ink } = readPalette();
  const uniforms = buildUniforms(paper, volt, ink);
  const material = new ShaderMaterial({
    vertexShader: cloudVertex,
    fragmentShader: cloudFragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });
  cache = { geometry: buildGeometry(cloud ?? computeCloud()), uniforms, material, halfWidth: COSMOS.glyphRadius, paper, ink, shape: '' };
  loadGlyph(cache);
  return cache;
}
