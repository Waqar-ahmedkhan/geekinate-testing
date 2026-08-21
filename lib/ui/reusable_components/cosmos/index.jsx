'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trackGlobe } from '@/lib/input/globe';
import { trackPointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const GLOBE_STANDIN =
  'radial-gradient(115% 78% at 50% 118%, rgba(184,224,27,0.20) 0%, rgba(184,224,27,0.07) 42%, rgba(184,224,27,0.02) 62%, transparent 76%)';

export default function CosmosCanvas() {
  const [painted, setPainted] = useState(false);
  const onFirstFrame = useCallback(() => setPainted(true), []);
  useEffect(() => trackPointer(), []);
  useEffect(() => trackGlobe(), []);

  useEffect(() => {
    if (scrollProgress.reduced) return undefined;
    const triggers = [
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: '+=140%',
        scrub: true,
        onUpdate: (self) => {
          stage.heroOut = self.progress;
        },
      }),
      ScrollTrigger.create({
        trigger: 'footer',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: (self) => {
          stage.footerIn = self.progress;
        },
      }),
    ];
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-[1]'>
      <div
        className='absolute inset-0 transition-opacity duration-700 ease-out'
        style={{ backgroundImage: GLOBE_STANDIN, opacity: painted ? 0 : 1 }}
      />
      <Scene onFirstFrame={onFirstFrame} />
    </div>
  );
}
