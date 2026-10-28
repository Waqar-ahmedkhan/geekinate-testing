import { SOFTWARE_GL } from '@/constants';

const MASKED = 'WebKit WebGL';
const STRICT = { failIfMajorPerformanceCaveat: true };
const contextOn = (canvas, options) => canvas.getContext('webgl2', options) ?? canvas.getContext('webgl', options);

const rendererOf = (gl) => {
  const plain = String(gl.getParameter(gl.RENDERER) ?? '');
  if (plain !== MASKED) return plain;
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? '') : plain;
};
const release = (gl) => gl?.getExtension('WEBGL_lose_context')?.loseContext();

export function rendersInHardware(makeCanvas) {
  const gl = contextOn(makeCanvas(), STRICT);
  if (gl) {
    const hardware = !SOFTWARE_GL.test(rendererOf(gl));
    release(gl);
    return hardware;
  }
  const fallback = contextOn(makeCanvas());
  release(fallback);
  return fallback ? false : null;
}
