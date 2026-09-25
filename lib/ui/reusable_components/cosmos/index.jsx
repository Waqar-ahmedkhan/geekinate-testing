'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { markGlobeReady } from '@/lib/boot/ready';
import { trackGlobe } from '@/lib/input/globe';
import { trackPointer } from '@/lib/input/pointer';
import { resetStage, watchStage } from '@/lib/scroll/stage';
import { COSMOS } from '@/constants';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

const GLOBE_STANDIN =
  'radial-gradient(115% 78% at 50% 118%, rgba(184,224,27,0.20) 0%, rgba(184,224,27,0.07) 42%, rgba(184,224,27,0.02) 62%, transparent 76%)';

export default function CosmosCanvas() {
  const pathname = usePathname();
  const [painted, setPainted] = useState(false);
  const [sceneWanted, setSceneWanted] = useState(false);
  const standing = COSMOS.globeRoutes.includes(pathname);
  const onFirstFrame = useCallback(() => {
    setPainted(true);
    markGlobeReady();
  }, []);
  const sceneEl = sceneWanted ? <Scene onFirstFrame={onFirstFrame} /> : null;
  useEffect(() => {
    let timer = 0;
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => setSceneWanted(true), 0);
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => trackPointer(), []);
  useEffect(() => trackGlobe(), []);
  useEffect(() => watchStage(), []);
  useEffect(() => {
    const frame = requestAnimationFrame(resetStage);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-[1]'>
      <div
        className='absolute inset-0 transition-opacity duration-700 ease-out'
        style={{ backgroundImage: GLOBE_STANDIN, opacity: painted || !standing ? 0 : 1 }}
      />
      {sceneEl}
    </div>
  );
}
