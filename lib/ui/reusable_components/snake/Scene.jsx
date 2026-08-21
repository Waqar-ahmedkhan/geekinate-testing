'use client';

import { Canvas } from '@react-three/fiber';
import SnakeDots from './SnakeDots';
import { SNAKE } from '@/constants';

export default function Scene() {
  const { cameraPosition, cameraFov, dpr } = SNAKE;
  return (
    <Canvas dpr={dpr} gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: cameraPosition, fov: cameraFov }}>
      <SnakeDots />
    </Canvas>
  );
}
