// Pointer position in normalised device coordinates, -1..1 on both axes, plus how much attention to pay to it. One listener for the
// whole app rather than one per consumer, and a plain object rather than state — the scene samples this every frame.
//
// `active` is a target, not a flag: the scene eases toward it, so the cloud releases the cursor on the way out of the window
// instead of snapping back the instant the pointer leaves.
export const pointer = { x: 0, y: 0, active: 0 };

// Touch is deliberately not wired. The pull follows a cursor that hovers; on a touch screen the finger is over the thing it is
// disturbing and the effect reads as the page fighting the scroll.
export function trackPointer() {
  if (typeof window === 'undefined') return () => {};
  const move = (event) => {
    // clientWidth, not innerWidth: innerWidth includes the scrollbar and the canvas does not, so the cursor and the scene disagree
    // by half the scrollbar's width all the way across the page — the pull lands consistently to one side of the cursor.
    const box = document.documentElement;
    pointer.x = (event.clientX / box.clientWidth) * 2 - 1;
    pointer.y = -((event.clientY / box.clientHeight) * 2 - 1);
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
