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
import { computeGlobe } from './pose';
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
import { COSMOS, GLOBE, GLOBE_PALETTE } from '@/constants';

const tone = (hex) => new Color(hex);
const attach = (geometry, name, data, size) => geometry.setAttribute(name, new BufferAttribute(data, size));

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

const build = ({ pose, network }) => {
  const { anchors, arcs, flares } = network;
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
  const shared = {
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uPixelRatio: { value: 1 },
    uScale: { value: 1 },
    uCameraZ: { value: COSMOS.cameraZ },
  };
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

export const getGlobe = (computed) => {
  cache = cache || build(computed ?? computeGlobe());
  return cache;
};

export const globePose = () => getGlobe().pose;

export { fitGlobe, globeApex } from './fit';
