export const intent = { value: '' };

const waiting = new Set();

export function chooseIntent(next) {
  intent.value = next;
  waiting.forEach((listener) => listener(next));
}

export function watchIntent(listener) {
  waiting.add(listener);
  return () => waiting.delete(listener);
}
