'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getCloud } from './cloud';
import { getGlobe } from '@/lib/globe/scene';
import { GLOBE } from '@/constants';

// Everything around the land: the body it sits on, the hot line on its limb, the bloom outside that, and the network of arcs and
// flares over the top. The land itself is the mark's own particle cloud — see MorphCloud beside this.
//
// The frame is read off the cloud's uniforms rather than solved again here, and that is deliberate. Two solvers agreeing is a thing
// that has to be maintained; one solver publishing is a thing that cannot drift. MorphCloud writes them and this reads them, and
// the order is guaranteed because R3F runs useFrame callbacks in mount order and Scene mounts the cloud first.
//
// Draw order is `renderOrder` alone. Nothing in this scene depth-tests — the particles hide the globe's far side by fading as they
// turn away — so the body has to land under the land, and the atmosphere over it.
export default function GlobeShell() {
  const frame = useRef(null);
  const spin = useRef(null);
  const { geometries, materials } = getGlobe();

  // Hidden outright once the globe has faded, rather than left to draw at zero opacity.
  //
  // `uOpacity` multiplies these shaders to nothing the moment the hero is behind you, so past that point every one of them is a
  // draw that provably cannot change a pixel — and they are the most expensive draws on the page. The body, the rim and the halo
  // are additive full-screen-ish spheres: the halo alone covers about 95% of the viewport at 16:9, and the three together push
  // roughly 1.6 screens of blended, ALU-heavy fragments every frame, which quadruples again on a 2x display. Paying that for the
  // whole scroll below the hero is the single largest cost in the scene, and it buys nothing.
  //
  // The threshold is a hair off zero rather than zero so the shells go while the fade is still finishing rather than one frame
  // after it, which is invisible — at 0.01 opacity there is nothing left to see.
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
    // The tilt is on the outer group and the turn on the inner one, so the globe leans once and spins inside its own lean. Both
    // orders are a rotation; only this one is an axial tilt.
    <group ref={frame} rotation-z={GLOBE.tilt}>
      <mesh geometry={geometries.ocean} material={materials.ocean} renderOrder={-2} />
      <mesh geometry={geometries.halo} material={materials.halo} renderOrder={-1} />
      {/* Over the land, because a route that leaves the surface has to be seen leaving it. */}
      <group ref={spin}>
        <lineSegments geometry={geometries.arc} material={materials.arc} renderOrder={2} frustumCulled={false} />
        <points geometry={geometries.flare} material={materials.flare} renderOrder={4} frustumCulled={false} />
      </group>
      {/* Last, and over the arcs on purpose: an arc crossing the limb has to pass behind the edge of the body, not over it. */}
      <mesh geometry={geometries.rim} material={materials.rim} renderOrder={3} />
    </group>
  );
}
