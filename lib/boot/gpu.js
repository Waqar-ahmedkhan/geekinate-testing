import { rendersInHardware } from './renderer';

let probe = null;
const probeHere = () => Boolean(rendersInHardware(() => document.createElement('canvas')));

const probeOffThread = () =>
  new Promise((resolve) => {
    const worker = new Worker(new URL('./gpu.worker.js', import.meta.url));
    const finish = (hardware) => {
      worker.terminate();
      resolve(hardware ?? probeHere());
    };
    worker.onmessage = ({ data }) => finish(data);
    worker.onerror = () => finish(null);
    worker.postMessage(null);
  });

export function probeGpu() {
  const offThread = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
  probe ??= offThread ? probeOffThread() : Promise.resolve(probeHere());
  return probe;
}
