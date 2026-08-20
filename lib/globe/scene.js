// The globe's shells and its network, built once and shared. The land is not here — it is a pose of the mark's own particle cloud
// and lives in lib/ui/reusable_components/cosmos/cloud, which calls `globePose` below to fill its own attribute.
//
// A module singleton rather than component state, for the reason the cloud beside it uses one: StrictMode remounts in dev, the build
// walks a 131,072-cell mask, and none of it depends on anything React knows. The frame loop mutates these uniforms in place and
// nothing is reallocated after the first call.
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { buildNetwork } from './arcs';
import { buildGlobePose } from './dots';
import {
  arcFragment,
  arcVertex,
  flareFragment,
  flareVertex,
  haloFragment,
  haloVertex,
  oceanFragment,
  oceanVertex,
  rimFragment,
  rimVertex,
} from './shaders';
import { seeded } from './sphere';
import { COSMOS, GLOBE, GLOBE_PALETTE } from '@/constants';

const tone = (hex) => new Color(hex);
const attach = (geometry, name, data, size) => geometry.setAttribute(name, new BufferAttribute(data, size));

// Everything here is additive and never writes depth. Additive is what makes light read as light on a black ground; not writing
// depth is what stops one glowing layer from punching a hole in the one behind it. Nothing depth-*tests* either — the particles hide
// their own far side by fading as they turn away, so there is no occluder to test against and no sorting to get wrong. Draw order is
// `renderOrder` alone, set where these are mounted.
const glow = (uniforms, vertexShader, fragmentShader, extra) =>
  new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    ...extra,
  });

let cache = null;

const build = () => {
  const random = seeded(GLOBE.seed);
  const pose = buildGlobePose(COSMOS.count, random, GLOBE.jitter);
  const { anchors, arcs, flares } = buildNetwork(pose, COSMOS.count, random);
  // A direction, not a colour. Colour carries a colour space and clamps its channels, and this one has a negative x.
  const light = new Vector3(...GLOBE.light).normalize();
  const arcGeometry = new BufferGeometry();
  attach(arcGeometry, 'position', arcs.positions, 3);
  attach(arcGeometry, 'aAlong', arcs.along, 1);
  attach(arcGeometry, 'aSeed', arcs.seed, 1);
  attach(arcGeometry, 'aEnds', arcs.ends, 2);
  attach(arcGeometry, 'aGroup', arcs.group, 1);
  const flareGeometry = new BufferGeometry();
  attach(flareGeometry, 'position', flares.positions, 3);
  attach(flareGeometry, 'aPhase', flares.phase, 1);
  attach(flareGeometry, 'aSpeed', flares.speed, 1);
  attach(flareGeometry, 'aAnchor', flares.anchor, 1);
  attach(flareGeometry, 'aGroup', flares.group, 1);
  // One object per uniform every layer reads, so the frame loop writes each of them once. `uOpacity` is the whole globe fading with
  // its own pose — the shells and the network have no business existing while the cloud is a letterform.
  const shared = {
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uPixelRatio: { value: 1 },
    uScale: { value: 1 },
    uCameraZ: { value: COSMOS.cameraZ },
  };
  // Which anchor the cursor is nearest and which pillar is hovered. Both are -1 for "nothing", which is outside every real index and
  // every real group, so the shaders' tolerance compare simply never matches.
  const select = { uFocus: { value: -1 }, uPillar: { value: -1 } };
  return {
    pose,
    anchors,
    shared,
    select,
    geometries: {
      arc: arcGeometry,
      flare: flareGeometry,
      ocean: new SphereGeometry(GLOBE.oceanRadius, 96, 64),
      rim: new SphereGeometry(GLOBE.rimRadius, 128, 80),
      halo: new SphereGeometry(GLOBE.haloShell, 64, 48),
    },
    materials: {
      // Additive like everything else, so the body brightens the black ground rather than covering it. It is the one layer that is
      // not really light — it is the depth the land sits on — but painting it as a solid would mean owning an opaque surface in a
      // scene that has deliberately turned depth testing off.
      ocean: glow(
        {
          uOcean: { value: tone(GLOBE_PALETTE.ocean) },
          uEdge: { value: tone(GLOBE_PALETTE.oceanEdge) },
          uGlow: { value: tone(GLOBE_PALETTE.haze) },
          uLight: { value: light },
          uHazeWidth: { value: GLOBE.hazeWidth },
          uHazeStrength: { value: GLOBE.hazeStrength },
          uOpacity: shared.uOpacity,
        },
        oceanVertex,
        oceanFragment
      ),
      arc: glow(
        {
          uTime: shared.uTime,
          uOpacity: shared.uOpacity,
          ...select,
          uSpeed: { value: GLOBE.arcSpeed },
          uBase: { value: GLOBE.arcBase },
          uArc: { value: tone(GLOBE_PALETTE.arc) },
          uHead: { value: tone(GLOBE_PALETTE.arcHead) },
          uArcFade: { value: new Vector2(GLOBE.arcFade[0], GLOBE.arcFade[1]) },
        },
        arcVertex,
        arcFragment
      ),
      flare: glow(
        {
          ...shared,
          ...select,
          uSize: { value: GLOBE.flareSize },
          uFlare: { value: tone(GLOBE_PALETTE.flare) },
          uCore: { value: tone(GLOBE_PALETTE.flareCore) },
        },
        flareVertex,
        flareFragment
      ),
      rim: glow(
        {
          uRim: { value: tone(GLOBE_PALETTE.rim) },
          uLight: { value: light },
          uWidth: { value: GLOBE.rimWidth },
          uStrength: { value: GLOBE.rimStrength },
          uOpacity: shared.uOpacity,
        },
        rimVertex,
        rimFragment
      ),
      halo: glow(
        {
          uHalo: { value: tone(GLOBE_PALETTE.halo) },
          uShell: { value: GLOBE.haloShell },
          uFalloff: { value: GLOBE.haloFalloff },
          uStrength: { value: GLOBE.haloStrength },
          uOpacity: shared.uOpacity,
        },
        haloVertex,
        haloFragment,
        { side: BackSide }
      ),
    },
  };
};

export const getGlobe = () => {
  cache = cache || build();
  return cache;
};

// The land pose, for the cloud to copy into its own buffer. Same object every call.
export const globePose = () => getGlobe().pose;

// The composition, solved rather than set. `drop` says how far the limb has fallen by the frame's edge and `apex` where the top of
// the globe sits; the radius that satisfies both falls out of the circle through those two points. In half-viewport-heights, which
// is why the aspect ratio is the only input.
//
// Derived as if the projection were orthographic. It is not quite — the camera is a perspective one — but it is parked far enough
// back that the error is a few percent, and `apex` and `drop` were tuned against the real thing anyway.
export const fitGlobe = (aspect) => {
  const [low, high] = GLOBE.aspectRange;
  const framed = Math.min(high, Math.max(low, aspect));
  const drop = GLOBE.drop;
  const radius = (framed * framed + drop * drop) / (2 * drop);
  return { radius, centreY: GLOBE.apex - radius };
};
