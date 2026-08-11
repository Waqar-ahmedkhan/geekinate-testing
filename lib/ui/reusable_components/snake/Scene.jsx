'use client';

import { Canvas } from '@react-three/fiber';
import SnakeDots from './SnakeDots';
import { SNAKE } from '@/constants';

// No lights, no environment, no post-processing. Points are unlit, so all three were dead weight once the solid tube went.
export default function Scene() {
  const { cameraPosition, cameraFov, dpr } = SNAKE;
  return (
    <Canvas dpr={dpr} gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: cameraPosition, fov: cameraFov }}>
      <SnakeDots />
    </Canvas>
  );
}
