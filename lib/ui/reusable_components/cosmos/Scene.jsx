'use client';

import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import GlobeShell from './GlobeShell';
import MorphCloud from './MorphCloud';
import { startingDpr } from './quality';
import { COSMOS } from '@/constants';

function TickerLoop() {
  const advance = useThree((state) => state.advance);
  useEffect(() => {
    const step = (time) => advance(time);
    gsap.ticker.add(step);
    return () => gsap.ticker.remove(step);
  }, [advance]);
  return null;
}

export default function Scene({ onFirstFrame }) {
  return (
    <Canvas
      frameloop='never'
      dpr={[1, startingDpr()]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: COSMOS.cameraFov, position: [0, 0, COSMOS.cameraZ], near: 0.1, far: 120 }}
    >
      <TickerLoop />
      <MorphCloud onFirstFrame={onFirstFrame} />
      <GlobeShell />
    </Canvas>
  );
}
