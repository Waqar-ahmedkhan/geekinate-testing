export const pointer = { x: 0, y: 0, px: 0, py: 0, active: 0 };

export function trackPointer() {
  if (typeof window === 'undefined') return () => {};
  const move = (event) => {
    const box = document.documentElement;
    pointer.x = (event.clientX / box.clientWidth) * 2 - 1;
    pointer.y = -((event.clientY / box.clientHeight) * 2 - 1);
    pointer.px = event.clientX;
    pointer.py = event.clientY;
    pointer.active = 1;
  };
  const leave = () => {
    pointer.active = 0;
  };
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerdown', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  return () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerdown', move);
    document.removeEventListener('pointerleave', leave);
  };
}
