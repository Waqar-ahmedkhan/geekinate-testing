'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trackPointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';

// three.js must not run through SSR, and this is the whole 3D bundle, so it loads on the client only.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Fixed to the viewport and rendered as a sibling of every section from the app shell, never nested inside one. `Section` carries
// `relative z-10`, and a positioned element with a z-index opens a stacking context — a canvas parented inside one has its own
// z-index trapped in that section's layer, which presents as the scene vanishing the moment you scroll past the first section
// rather than as a layering fault. This sits at z-0 underneath every section, which is what makes the translucent surfaces read.
//
// It was briefly moved to z-30 so the mark could be seen crossing the white sections, and that was wrong: on top it paints over
// cards, project tiles and body copy, and the dispersal in particular landed as a grey haze across a screen of testimonials. Behind
// is the whole point — the scene shows through the dark sections and their cards, and the paper sections simply hide it.
export default function CosmosCanvas() {
  useEffect(() => trackPointer(), []);

  // Two triggers, one at each end of the page, each measured against the section it belongs to. The hero's scrubs the mark apart as
  // the hero scrolls away; the footer's puts it back together as the footer arrives. Everything between them is the scattered pose,
  // and it needs no trigger of its own — it is simply where both progresses leave the scene.
  //
  // Measuring against the sections rather than against the document's total height is what keeps this stable: adding a section in
  // the middle changes neither end.
  useEffect(() => {
    if (scrollProgress.reduced) return undefined;
    const triggers = [
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
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
    // Both triggers measure their section the moment they are created, and at that moment the display faces have not swapped in and
    // the scene's own bundle is still compiling — so the hero can be measured at nearly no height. When it is, `start` and `end`
    // collapse onto each other and the progress reads 1 forever: the mark spends the whole page in its footer pose, centred, and the
    // hero looks like it simply ignored its own layout. Re-measuring once the fonts and the load event have landed is the fix.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-0'>
      <Scene />
    </div>
  );
}
