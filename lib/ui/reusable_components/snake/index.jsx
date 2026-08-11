'use client';

import dynamic from 'next/dynamic';

// three.js must not run through SSR, and the scene is the whole 3D bundle, so it loads on the client only.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

// Fixed to the viewport rather than parented to the hero, because the mark travels the whole page.
//
// It sits at z-40, above every section and below `Nav` and `Footer` at z-50. Sections at z-10 would otherwise occlude the journey
// entirely and the snake would only ever be visible in the hero. Dots can overlay content in a way the solid tube could not — they
// read as a scatter passing in front rather than a bar drawn through it — but the brief's §9 weave, where chosen sections occlude
// it and others do not, is still an open design decision.
export default function SnakeCanvas() {
  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-40'>
      <Scene />
    </div>
  );
}
