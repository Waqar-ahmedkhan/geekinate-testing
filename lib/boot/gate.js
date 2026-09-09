export const gate = { open: false };

const waiting = new Set();

export function openGate() {
  if (gate.open) return;
  gate.open = true;
  waiting.forEach((listener) => listener());
  waiting.clear();
}

export function watchGate(listener) {
  if (gate.open) {
    listener();
    return () => {};
  }
  waiting.add(listener);
  return () => waiting.delete(listener);
}
