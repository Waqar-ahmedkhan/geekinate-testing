'use client';

import { Canvas } from '@react-three/fiber';
import GlobeShell from './GlobeShell';
import MorphCloud from './MorphCloud';
import { startingDpr } from './quality';
import { COSMOS } from '@/constants';

// One canvas for the whole page: the cloud that is the hero's globe, the scattered field, and the footer's letterform, plus the
// shells and network the globe wears while it is a globe.
//
// MorphCloud is mounted first and that is load-bearing rather than tidy — it solves the globe's frame and publishes it on the
// cloud's uniforms, and GlobeShell reads them. R3F runs useFrame callbacks in mount order, so this order is what keeps the shells
// on the same frame as the land rather than one behind it.
//
// `dpr` is capped, because the cloud is fill-rate bound and not vertex bound: a 3x phone would render nine times the fragments of
// a 1x desktop for a difference nobody can see in a 15px sprite. The cap is no longer a flat 2 — it opens at whatever the machine
// looks capable of and is stepped down from there by what it actually delivers, which is the one lever that buys a weak laptop a
// frame rate without touching the composition. See quality.
//
// **Antialiasing is on, and it is not decoration.** Both of the globe's inner shells end in a hard geometric silhouette carrying a
// high alpha: the ocean's is a flat `uOpacity` right up to its own limb, and the rim's exponential *peaks* at exactly the point the
// mesh stops. With no multisampling those two boundaries are a full-contrast step from bright volt to black, and the globe reads
// with a visibly stepped edge. Nothing in the shaders can fix it without changing what the shells look like — the ocean is meant to
// be a solid body and the rim is meant to be brightest on the limb — so the coverage has to be sampled instead of the falloff
// redesigned. The cost is confined to where it is paid: the shells only draw while the globe is on screen (see GlobeShell), and on
// a machine that cannot afford it the governor drops the pixel ratio, which cuts the multisampled area quadratically.
export default function Scene({ onFirstFrame }) {
  return (
    <Canvas
      dpr={[1, startingDpr()]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: COSMOS.cameraFov, position: [0, 0, COSMOS.cameraZ], near: 0.1, far: 120 }}
    >
      <MorphCloud onFirstFrame={onFirstFrame} />
      <GlobeShell />
    </Canvas>
  );
}
