'use client';

import { Canvas } from '@react-three/fiber';
import GlobeShell from './GlobeShell';
import MorphCloud from './MorphCloud';
import { startingDpr } from './quality';
import { COSMOS } from '@/constants';

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
