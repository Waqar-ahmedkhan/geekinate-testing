import { COSMOS } from '@/constants';

export const globe = { angle: 0, velocity: 0, dragging: false, pillar: -1 };

const onScrollbar = (event) => {
  const root = document.documentElement;
  return event.clientX >= root.clientWidth || event.clientY >= root.clientHeight;
};

const engaged = (event) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return false;
  if (onScrollbar(event)) return false;
  if (event.target.closest && event.target.closest('a, button, input, textarea, [role="button"]')) return false;
  const hero = document.querySelector('#hero');
  if (!hero) return false;
  const box = hero.getBoundingClientRect();
  return event.clientY >= box.top && event.clientY <= box.bottom;
};

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

export function coastGlobe(delta) {
  if (globe.dragging) return;
  globe.angle += globe.velocity * delta;
  globe.velocity *= Math.exp(-COSMOS.dragDecay * delta);
}
