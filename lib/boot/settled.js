export const boot = { settled: false };

const waiting = new Set();

let armed = false;

const settle = () => {
  boot.settled = true;
  waiting.forEach((listener) => listener());
  waiting.clear();
};

const afterPaint = () => requestAnimationFrame(() => setTimeout(settle, 0));

const arm = () => {
  if (armed) return;
  armed = true;
  if (document.readyState === 'complete') afterPaint();
  else window.addEventListener('load', afterPaint, { once: true });
};

export function watchSettled(listener) {
  if (boot.settled) {
    listener();
    return () => {};
  }
  waiting.add(listener);
  arm();
  return () => waiting.delete(listener);
}
