export const sheet = { over: false };

const waiting = new Set();

export function markSheet(over) {
  if (sheet.over === over) return;
  sheet.over = over;
  waiting.forEach((listener) => listener(over));
}

export function watchSheet(listener) {
  waiting.add(listener);
  listener(sheet.over);
  return () => waiting.delete(listener);
}
