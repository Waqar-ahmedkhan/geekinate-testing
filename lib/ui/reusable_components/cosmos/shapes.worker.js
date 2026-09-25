import { computeShapes } from './shapes';

const buffersOf = (value) => {
  if (ArrayBuffer.isView(value)) return [value.buffer];
  if (value && typeof value === 'object') return Object.values(value).flatMap(buffersOf);
  return [];
};

self.onmessage = () => {
  const shapes = computeShapes();
  self.postMessage(shapes, [...new Set(buffersOf(shapes))]);
};
