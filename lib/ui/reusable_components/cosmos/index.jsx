'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trackGlobe } from '@/lib/input/globe';
import { trackPointer } from '@/lib/input/pointer';
import { scrollProgress } from '@/lib/scroll/progress';
import { stage } from '@/lib/scroll/stage';

// three.js must not run through SSR, and this is the whole 3D bundle, so it loads on the client only.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// What the hero stands on until the real globe can draw.
//
// The page's own markup is served and painted in well under a tenth of a second; the scene behind it cannot be, because it is the
// three.js bundle plus a land pose solved off a 131,072-cell mask plus however long this machine takes to compile six shader
// programs. On a fast desktop over localhost that gap is a few hundred milliseconds — on a low-end laptop over a real connection it
// is seconds, and every one of them is spent looking at a headline floating on an empty black screen, which is what "it loads very
// slow" actually describes. The bundle is not going to get much smaller; the hole it leaves can stop being a hole.
//
// A single radial gradient, no image and no request, sized to the composition the globe resolves into — the apex near the middle of
// the frame and the body filling everything under it. It is deliberately soft: the job is to make the hero read as lit and
// intentional from the first paint, not to impersonate a world and then visibly swap for a better one.
const GLOBE_STANDIN =
  'radial-gradient(115% 78% at 50% 118%, rgba(184,224,27,0.20) 0%, rgba(184,224,27,0.07) 42%, rgba(184,224,27,0.02) 62%, transparent 76%)';

// Fixed to the viewport and rendered as a sibling of every section from the app shell, never nested inside one. `Section` carries
// `relative z-10`, and a positioned element with a z-index opens a stacking context — a canvas parented inside one has its own
// z-index trapped in that section's layer, which presents as the scene vanishing the moment you scroll past the first section
// rather than as a layering fault. This sits under every section, which is what makes the translucent surfaces read.
//
// It was briefly moved to z-30 so the mark could be seen crossing the white sections, and that was wrong: on top it paints over
// cards, project tiles and body copy, and the dispersal in particular landed as a grey haze across a screen of testimonials. Behind
// is the whole point — the scene shows through the dark sections and their cards, and the paper sections simply hide it.
export default function CosmosCanvas() {
  // Held until the scene has actually put a frame on screen, not until its module arrives. The two are not the same moment — the
  // geometry build and the shader compile sit between them, and on a weak GPU that is the longer half of the wait.
  const [painted, setPainted] = useState(false);
  const onFirstFrame = useCallback(() => setPainted(true), []);
  useEffect(() => trackPointer(), []);
  // Drag-to-spin lives with the pointer rather than on the canvas, because the canvas is pointer-events-none and has to stay that
  // way — it is fixed over the whole page, and a canvas that takes events is a canvas that eats every click on the site.
  useEffect(() => trackGlobe(), []);

  // Two triggers, one at each end of the page, each measured against the section it belongs to. The hero's closes the globe as its
  // section scrolls away; the footer's opens the letterform as the footer arrives. The scattered field between them needs no trigger
  // of its own — it is simply where both progresses leave the cloud.
  //
  // Measuring against the sections rather than against the document's total height is what keeps this stable: adding a section in
  // the middle changes neither end.
  useEffect(() => {
    if (scrollProgress.reduced) return undefined;
    const triggers = [
      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        // Not `bottom top`. The hero is one viewport tall, so that range spends the entire handover inside a single screen of
        // scroll and the world comes apart on the first flick of the wheel. Spread over 1.4 screens it reads as the globe breaking
        // up as you leave, which is the same motion at a third of the rate. Nothing else measures this trigger, so lengthening it
        // costs no layout anywhere.
        end: '+=140%',
        scrub: true,
        onUpdate: (self) => {
          stage.heroOut = self.progress;
        },
      }),
      ScrollTrigger.create({
        trigger: 'footer',
        // Exactly the footer's own arrival, and the two ends are the point. `top bottom` is the frame the panel's first pixel
        // appears in, so the cloud is still fully scattered when the footer starts to show; `top top` is the last pixel of the
        // document, because the footer is one viewport tall — so the letterform completes on the scroll that runs out and nowhere
        // before it.
        //
        // It used to start at `bottom+=70%`, on the reasoning that reassembly wanted more scroll than the footer's arrival provides.
        // That was written for a mark four fifths of the viewport tall, and it front-loaded the whole thing: a 1.7-viewport range
        // ending at the document's foot is already 71 per cent spent by the time the panel is half open, which put a finished G on
        // screen with a screen of scrolling still to go. The mark is half that size now and one viewport is scroll enough.
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: (self) => {
          stage.footerIn = self.progress;
        },
      }),
    ];
    // Both triggers measure their section the moment they are created, and at that moment the display faces have not swapped in and
    // the scene's own bundle is still compiling — so a section can be measured at nearly no height, which collapses `start` onto
    // `end` and pins the progress at 1 forever. Re-measuring once the fonts and the load event have landed is the fix.
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
      {/* Under the canvas, and it stays mounted through the crossfade rather than being swapped out on the frame the scene arrives:
          a hard cut from the stand-in to the real globe is a flash, and the two are close enough in value that a fade reads as the
          globe resolving. It is removed from the tree once that fade has run. */}
      <div
        className='absolute inset-0 transition-opacity duration-700 ease-out'
        style={{ backgroundImage: GLOBE_STANDIN, opacity: painted ? 0 : 1 }}
      />
      <Scene onFirstFrame={onFirstFrame} />
    </div>
  );
}
