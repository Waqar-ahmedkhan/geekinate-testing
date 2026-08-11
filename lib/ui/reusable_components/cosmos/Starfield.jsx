'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry } from 'three';
import { fieldFragment, fieldVertex } from './shaders';
import { readPalette } from './palette';
import { pointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { COSMOS } from '@/constants';

// The ground the cloud is read against, and the only thing on the page that supplies a sense of travel. It is deliberately a
// separate object from the cloud: it never morphs, never reacts to the cursor beyond parallax, and every star runs the same path
// toward the camera on its own offset — see the shader, where the motion lives.
const buildGeometry = () => {
  const positions = new Float32Array(COSMOS.fieldCount * 3);
  const seed = new Float32Array(COSMOS.fieldCount),
    tint = new Float32Array(COSMOS.fieldCount);
  for (let i = 0; i < COSMOS.fieldCount; i += 1) {
    positions[i * 3] = (Math.random() * 2 - 1) * COSMOS.fieldSpread;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * COSMOS.fieldSpread;
    // z is not sampled here. The shader derives it from the clock and the seed so the field can travel and recycle without a buffer
    // upload — this slot exists only because the attribute is a vec3.
    positions[i * 3 + 2] = 0;
    seed[i] = Math.random();
    tint[i] = Math.random() < 0.12 ? 1 : 0;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seed, 1));
  geometry.setAttribute('aTint', new BufferAttribute(tint, 1));
  return geometry;
};

export default function Starfield() {
  const points = useRef(null);
  const material = useRef(null);
  const geometry = useMemo(() => buildGeometry(), []);
  const uniforms = useMemo(() => {
    const { paper, volt } = readPalette();
    return {
      uTime: { value: 0 },
      uSpeed: { value: COSMOS.fieldSpeed },
      uDepth: { value: COSMOS.fieldDepth },
      uNear: { value: COSMOS.fieldNear },
      uSize: { value: COSMOS.fieldSize },
      uCameraZ: { value: COSMOS.cameraZ },
      uPixelRatio: { value: 1 },
      uPaper: { value: paper },
      uVolt: { value: volt },
      uOpacity: { value: 0.85 },
    };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    const values = material.current.uniforms;
    values.uTime.value = state.clock.elapsedTime;
    values.uPixelRatio.value = state.gl.getPixelRatio();
    if (scrollProgress.reduced) return;
    const step = Math.min(1, delta * 60);
    points.current.position.x += (-pointer.x * COSMOS.parallax - points.current.position.x) * 0.03 * step;
    points.current.position.y += (-pointer.y * COSMOS.parallax - points.current.position.y) * 0.03 * step;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={fieldVertex}
        fragmentShader={fieldFragment}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
