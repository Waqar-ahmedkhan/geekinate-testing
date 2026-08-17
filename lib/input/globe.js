// What the reader is doing to the globe: how far they have dragged it round, and which service pillar they are hovering.
//
// A plain mutable object rather than state, for the same reason as `pointer` beside it — the scene samples this every frame, and a
// React re-render per frame would cost more than the scene being driven. The hero writes `pillar` from a hover handler; the drag
// listeners below write the rest; MorphCloud reads all of it.
import { COSMOS } from '@/constants';

export const globe = { angle: 0, velocity: 0, dragging: false, pillar: -1 };

// A drag is only a drag if it is a mouse, over the hero, and not on something clickable.
//
// Touch is deliberately excluded. A horizontal drag on a phone is how you scroll a carousel and how the browser goes back, and a
// globe that eats it is a globe that breaks the page. The cursor lift is left out of touch for the same reason — see `pointer`.
const engaged = (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return false;
  if (event.target.closest && event.target.closest('a, button, input, textarea, [role="button"]')) return false;
  const hero = document.querySelector('#hero');
  if (!hero) return false;
  const box = hero.getBoundingClientRect();
  return event.clientY >= box.top && event.clientY <= box.bottom;
};

// Angle accumulates on the CPU and rides to the shader as one uniform. The velocity is re-estimated on every move rather than
// smoothed, so a fling reflects the last flick of the wrist instead of the average of the whole drag — a slow drag that ends in a
// snap should coast, and an averaged velocity refuses to.
export function trackGlobe() {
  if (typeof window === 'undefined') return () => {};
  let last = 0,
    stamp = 0;
  const down = (event) => {
    if (!engaged(event)) return;
    globe.dragging = true;
    globe.velocity = 0;
    last = event.clientX;
    stamp = event.timeStamp;
    // Blocks the text selection a drag across the headline would otherwise paint. Buttons and links are already excluded above, so
    // nothing that needed the default is losing it.
    event.preventDefault();
  };
  const move = (event) => {
    if (!globe.dragging) return;
    const step = (event.clientX - last) * COSMOS.dragTurn;
    const elapsed = Math.max(event.timeStamp - stamp, 8) / 1000;
    last = event.clientX;
    stamp = event.timeStamp;
    globe.angle += step;
    globe.velocity = step / elapsed;
  };
  const release = () => {
    globe.dragging = false;
  };
  window.addEventListener('pointerdown', down);
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  return () => {
    window.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', release);
  };
}

// The fling, integrated once a frame. Exponential rather than linear so the coast has no edge to it: a linear decay stops dead at a
// frame boundary, which reads as the globe being caught rather than as it running out.
export function coastGlobe(delta) {
  if (globe.dragging) return;
  globe.angle += globe.velocity * delta;
  globe.velocity *= Math.exp(-COSMOS.dragDecay * delta);
}
