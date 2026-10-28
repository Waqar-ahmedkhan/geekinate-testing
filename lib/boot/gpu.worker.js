import { rendersInHardware } from './renderer';

self.onmessage = () => self.postMessage(rendersInHardware(() => new OffscreenCanvas(1, 1)));
