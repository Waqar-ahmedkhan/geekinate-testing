'use client';

import { Canvas } from '@react-three/fiber';
import MorphCloud from './MorphCloud';
import { COSMOS } from '@/constants';

// One canvas, and only the mark on it. The substrate used to share it and now sits on a plain 2D canvas underneath — see
// lib/ui/reusable_components/substrate for why.
//
// `dpr` is capped at 2. The cloud is fill-rate bound, not vertex bound, and a 3x phone would render nine times the fragments of a
// 1x desktop for a difference nobody can see in a 15px sprite.
export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: COSMOS.cameraFov, position: [0, 0, COSMOS.cameraZ], near: 0.1, far: 120 }}
    >
      <MorphCloud />
    </Canvas>
  );
}
