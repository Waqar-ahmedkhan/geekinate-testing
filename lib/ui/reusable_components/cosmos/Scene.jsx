'use client';

import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import GlobeShell from './GlobeShell';
import MorphCloud from './MorphCloud';
import { prepareCloud } from './cloud';
import { startingDpr } from './quality';
import { gate } from '@/lib/boot/gate';
import { boot } from '@/lib/boot/ready';
import { COSMOS } from '@/constants';

const coveredByPreloader = () => boot.globe && !gate.open;

function TickerLoop() {
  const advance = useThree((state) => state.advance);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    let compiled = false;
    gl.compileAsync(scene, camera).then(() => {
      compiled = true;
    });
    const step = (time) => {
      if (compiled && !coveredByPreloader()) advance(time);
    };
    gsap.ticker.add(step);
    return () => gsap.ticker.remove(step);
  }, [advance, gl, scene, camera]);
  return null;
}

export default function Scene({ onFirstFrame }) {
  const [prepared, setPrepared] = useState(false);
  useEffect(() => {
    let live = true;
    prepareCloud().then(() => live && setPrepared(true));
    return () => {
      live = false;
    };
  }, []);
  if (!prepared) return null;
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
