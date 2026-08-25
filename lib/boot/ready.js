export const boot = { globe: false };

const waiting = new Set();

export function markGlobeReady() {
  if (boot.globe) return;
  boot.globe = true;
  waiting.forEach((listener) => listener());
  waiting.clear();
}

export function watchGlobeReady(listener) {
  if (boot.globe) {
    listener();
    return () => {};
  }
  waiting.add(listener);
  return () => waiting.delete(listener);
}
