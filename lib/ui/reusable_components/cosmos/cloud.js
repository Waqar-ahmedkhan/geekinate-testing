import { BufferAttribute, BufferGeometry, ShaderMaterial, Vector2, Vector3 } from 'three';
import { cloudFragment, cloudVertex } from './shaders';
import { readPalette } from './palette';
import { sampleCloud } from '@/lib/shape/cloud';
import { sampleGlyph } from '@/lib/shape/glyph';
import { COSMOS } from '@/constants';

// The mark's geometry and uniforms, built once for the page and shared.
//
// A module singleton rather than component state, because two things draw these particles: the mark itself, and the pass that stamps
// them into the substrate's cell grid. Those two have to agree exactly — same positions, same pose, same scroll phase — and the only
// way to guarantee that is for them to be the same objects. Threading them through React would leave the wake a frame behind the
// mark, on every frame, forever.
//
// Never disposed. It lives as long as the page does, and StrictMode's dev remount must not tear it down under the second mount.
const MARK = '/brand/geekinate-mark.svg';

let cache = null;

const buildGeometry = () => {
  const cloud = sampleCloud(COSMOS.count, { radius: COSMOS.cloudRadius, flatten: COSMOS.cloudFlatten });
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
  const normals = new Float32Array(COSMOS.count * 3);
  // Facing the camera until the glyph resolves. A zero normal normalises to NaN in the shader and takes the whole mark with it.
  for (let i = 0; i < COSMOS.count; i += 1) normals[i * 3 + 2] = 1;
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(cloud, 3));
  // Seeded with the cloud itself, so before the glyph resolves the morph is the identity and nothing jumps if it never arrives.
  geometry.setAttribute('aGlyph', new BufferAttribute(cloud.slice(), 3));
  geometry.setAttribute('aNormal', new BufferAttribute(normals, 3));
  geometry.setAttribute('aRand', new BufferAttribute(random, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geometry.setAttribute('aTint', new BufferAttribute(tint, 1));
  return geometry;
};

const buildUniforms = (paper, volt, ink) => ({
  uTime: { value: 0 },
  // Assembled at rest, because the hero is the top of the page and the mark is formed there.
  uForm: { value: 1 },
  // Radians the mark is turned about its own vertical, on top of the correction that keeps it facing the camera.
  uSpin: { value: 0 },
  uOffsetX: { value: 0 },
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
  // Seeded at paper and rewritten every frame — a clone, because the value is lerped in place and the two source colours have to
  // stay untouched for it to lerp between them.
  uHighlight: { value: paper.clone() },
  uVolt: { value: volt },
  // The two ends of the mark's own value range, both derived from brand tokens rather than picked: the shaded side is volt carried
  // most of the way to ink, the sheen is volt carried most of the way to paper. Neither is a new colour, and holding the specular in
  // the green family is what keeps it from putting a white speck on every bead.
  uShade: { value: volt.clone().lerp(ink, COSMOS.shadeDepth) },
  uSheen: { value: volt.clone().lerp(paper, COSMOS.sheenLift) },
  uCore: { value: COSMOS.beadCore },
  uGloss: { value: COSMOS.gloss },
  uOpacity: { value: 1 },
});

// The letterform is rasterised off the brand SVG on the client, so it lands a frame or several after the geometry. Writing it
// straight into the live attribute avoids rebuilding anything and leaves every other buffer untouched.
const loadGlyph = (entry) => {
  sampleGlyph(COSMOS.count, {
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
    entry.mask = glyph.mask;
  });
};

// The material is built here rather than declared in JSX, and that is not a style choice. A uniforms object handed to a declarative
// material is not guaranteed to be the object the material ends up holding — and when it is not, every per-frame write lands on a
// copy nobody renders. The mark then draws at its shader defaults: assembled, centred, full size, ignoring the scroll entirely.
// Owning the material here makes the identity unambiguous, and it is the same object the substrate seeds from.
export function getCloud() {
  if (cache) return cache;
  // halfWidth is seeded at the radius so the first frames under-reach rather than overhang — see the anchor note in MorphCloud.
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
  // paper and ink are kept on the entry rather than only in the uniform: they are the two ends the highlight lerps between every
  // frame as the ground changes under the mark, and a lerp needs both endpoints intact.
  cache = { geometry: buildGeometry(), uniforms, material, halfWidth: COSMOS.glyphRadius, mask: null, paper, ink };
  loadGlyph(cache);
  return cache;
}
