const waiting = new Set();
let held = false;

export function holdScroll(next) {
  if (held === next) return;
  held = next;
  waiting.forEach((listener) => listener(next));
}

export function watchScrollLock(listener) {
  waiting.add(listener);
  listener(held);
  return () => waiting.delete(listener);
}
