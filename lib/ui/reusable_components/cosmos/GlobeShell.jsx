'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getCloud } from './cloud';
import { getGlobe } from '@/lib/globe/scene';
import { GLOBE } from '@/constants';

export default function GlobeShell() {
  const frame = useRef(null);
  const spin = useRef(null);
  const { geometries, materials } = getGlobe();

  useFrame(() => {
    const values = getCloud().uniforms;
    const showing = values.uGlobeMix.value > 0.01;
    frame.current.visible = showing;
    if (!showing) return;
    frame.current.position.y = values.uGlobeY.value;
    frame.current.scale.setScalar(values.uGlobeRadius.value);
    spin.current.rotation.y = values.uGlobeSpin.value;
  });

  return (
    <group ref={frame} rotation-z={GLOBE.tilt}>
      <mesh geometry={geometries.ocean} material={materials.ocean} renderOrder={-2} />
      <mesh geometry={geometries.halo} material={materials.halo} renderOrder={-1} />
      <group ref={spin}>
        <lineSegments geometry={geometries.arc} material={materials.arc} renderOrder={2} frustumCulled={false} />
        <points geometry={geometries.flare} material={materials.flare} renderOrder={4} frustumCulled={false} />
      </group>
      <mesh geometry={geometries.rim} material={materials.rim} renderOrder={3} />
    </group>
  );
}
