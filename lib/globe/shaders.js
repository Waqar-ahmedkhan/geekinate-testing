// GLSL for the globe's shells and its network. The land itself is not here — it is a pose of the mark's own particle cloud, and its
// shading lives in lib/ui/reusable_components/cosmos/shaders with the rest of the material.
//
// Written for ShaderMaterial, so three.js prepends `position`, `normal`, `normalMatrix`, `modelViewMatrix` and `projectionMatrix`
// and they are used undeclared below on purpose. No backticks anywhere: these are template literals.

// Screen-space distance from the globe's centre, in globe radii, recovered from a surface normal. Every glow below is a falloff in
// that unit rather than a fresnel exponent, and the difference matters because the sphere is resized on every viewport — a rim
// tuned as an exponent on a desktop is a sixty-pixel smear there and a hairline on a phone.
//
// Exact under an orthographic camera, where the view direction is a constant. The scene's camera is a perspective one parked far
// back with a very narrow field of view precisely so this stays true to within a few percent — see the camera note in
// constants/cosmos. It is not exact, and it does not need to be: these are soft glows, and the error is a fraction of their falloff.
const OFFSET = /* glsl */ `
  float screenOffset(vec3 normalView) {
    float axial = clamp(abs(normalView.z), 0.0, 1.0);
    return sqrt(max(0.0, 1.0 - axial * axial));
  }
`;

// Whether this vertex is one the page is currently pointing at. Two independent selections, and they compose: `uFocus` is the single
// anchor nearest the cursor, `uPillar` a whole quarter of the network lit by a hover in the hero's eyebrow.
//
// Compared with a tolerance rather than with ==. These arrive as floats through a varying and interpolate along a line segment;
// both ends of an arc carry the same value so the interpolation is a no-op, but an exact float compare on interpolated data is a
// bug waiting for the first segment that does not.
const SELECT = /* glsl */ `
  uniform float uFocus;
  uniform float uPillar;
  float selected(float anchorA, float anchorB, float group) {
    float focused = step(abs(anchorA - uFocus), 0.5) + step(abs(anchorB - uFocus), 0.5);
    float pillared = step(abs(group - uPillar), 0.5);
    return clamp(focused + pillared, 0.0, 1.0);
  }
`;

// The ocean. It exists to give the land something to sit on, and it is not blank: the reference's disc carries a broad haze
// gathered under the limb and fading inward, which is the atmosphere seen through its own depth.
//
// The haze cannot key on how much the surface faces the camera. The frame only ever shows the band between the apex and its own
// bottom edge, and that band is entirely near the limb — the facing ratio is close to zero across every pixel of it, so a fresnel
// term there is a constant. Screen offset varies across exactly the range that is visible.
export const oceanVertex = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vNormalLocal = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const oceanFragment = /* glsl */ `
  uniform vec3 uOcean;
  uniform vec3 uEdge;
  uniform vec3 uGlow;
  uniform vec3 uLight;
  uniform float uHazeWidth;
  uniform float uHazeStrength;
  uniform float uOpacity;
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  ${OFFSET}
  void main() {
    float lit = 0.42 + 0.58 * smoothstep(-0.6, 0.9, dot(vNormalLocal, normalize(uLight)));
    float haze = exp(-(1.0 - screenOffset(vNormalView)) / uHazeWidth);
    gl_FragColor = vec4(mix(uEdge, uOcean, lit) + uGlow * haze * uHazeStrength * lit, uOpacity);
  }
`;

// The arcs. Everything animate is derived from the clock and the per-arc seed, so the geometry is built once and never touched.
export const arcVertex = /* glsl */ `
  attribute float aAlong;
  attribute float aSeed;
  attribute vec2 aEnds;
  attribute float aGroup;
  varying float vAlong;
  varying float vSeed;
  varying float vSelected;
  ${SELECT}
  void main() {
    vAlong = aAlong;
    vSeed = aSeed;
    vSelected = selected(aEnds.x, aEnds.y, aGroup);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBase;
  uniform float uOpacity;
  uniform vec3 uArc;
  uniform vec3 uHead;
  varying float vAlong;
  varying float vSeed;
  varying float vSelected;
  void main() {
    // Faded at both ends. A route that starts and stops at full strength reads as a drawn line between two pins; one that emerges
    // from the surface and sinks back into it reads as a path.
    float body = pow(sin(vAlong * 3.14159265), 0.7);
    // A selected route runs its head three times faster as well as brighter. Brightness alone reads as a highlight painted over the
    // network; the change of pace is what makes it read as that route carrying traffic.
    float travel = fract(uTime * uSpeed * (1.0 + vSelected * 2.0) + vSeed);
    // Sixteen, not nine. At nine the bright head spans a sixth of the route, and a sixth of every arc carrying the pale end of the
    // ramp is not a head — it is most of the network drawn in paper, which is how twenty-six volt routes came out looking like
    // white pencil lines. This is a glint travelling along a volt thread.
    float lead = (vAlong - travel) * 16.0;
    float head = exp(-lead * lead);
    float strength = (uBase + head * 0.95) * (1.0 + vSelected * 1.6);
    // Clamped, because additive blending does not clamp its own source factor: an alpha over one drives the green channel past
    // full while red and blue trail, and the arc turns acid rather than bright.
    gl_FragColor = vec4(mix(uArc, uHead, min(1.0, head + vSelected * 0.3)), min(1.0, body * strength) * uOpacity);
  }
`;

// The flares. A four-point star, built rather than sampled from a sprite: the spikes have to stay sharp while the point scales
// through its whole cycle, and a texture soft enough not to alias at the small end is a blur at the large one.
export const flareVertex = /* glsl */ `
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aAnchor;
  attribute float aGroup;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uCameraZ;
  varying float vPulse;
  varying float vFacing;
  varying float vSelected;
  ${SELECT}
  void main() {
    vSelected = selected(aAnchor, aAnchor, aGroup);
    // Fast in, slow out, then dark for the rest of the cycle. The dark stretch is what makes the appearances read as random: with
    // the pulse filling its period every flare is simply always on, at a brightness that happens to vary.
    //
    // A selected flare is pinned on instead of cycling. The cursor pointing at a junction has to light *that* junction now, and a
    // flare that happens to be in the dark two-thirds of its cycle would answer a second later or not at all.
    float local = fract(uTime * aSpeed + aPhase);
    float cycle = smoothstep(0.0, 0.06, local) * (1.0 - smoothstep(0.09, 0.42, local));
    vPulse = max(cycle, vSelected);
    vFacing = normalize(normalMatrix * position).z;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize * uPixelRatio * uScale * (0.25 + vPulse * 0.75) * (uCameraZ / -viewPosition.z);
  }
`;

export const flareFragment = /* glsl */ `
  uniform vec3 uFlare;
  uniform vec3 uCore;
  uniform float uOpacity;
  varying float vPulse;
  varying float vFacing;
  varying float vSelected;
  void main() {
    if (vFacing < 0.02 || vPulse < 0.01) discard;
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float radius = length(uv);
    float core = exp(-radius * radius * 22.0);
    // Two crossed spikes. Each is a narrow exponential across one axis multiplied by a linear fade along the other, which is what
    // gives a spike that tapers to a point instead of a bar with soft ends.
    float across = exp(-abs(uv.y) * 24.0) * max(0.0, 1.0 - abs(uv.x));
    float down = exp(-abs(uv.x) * 24.0) * max(0.0, 1.0 - abs(uv.y));
    float star = core + (across + down) * 0.5;
    // The sprite is square and the spikes run to its edge, so without this the star is clipped into a diamond at full brightness.
    float mask = 1.0 - smoothstep(0.72, 1.0, radius);
    float alpha = star * mask * vPulse * clamp(vFacing * 3.0, 0.0, 1.0) * (1.0 + vSelected * 0.8);
    gl_FragColor = vec4(mix(uFlare, uCore, core), alpha * uOpacity);
  }
`;

// The rim: the hot line on the limb itself, drawn on a shell a fraction larger than the ocean. Its width is set in globe radii
// rather than as a fresnel exponent — see the note on screenOffset.
export const rimVertex = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vNormalLocal = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const rimFragment = /* glsl */ `
  uniform vec3 uRim;
  uniform vec3 uLight;
  uniform float uWidth;
  uniform float uStrength;
  uniform float uOpacity;
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  ${OFFSET}
  void main() {
    float lit = 0.28 + 0.72 * smoothstep(-0.55, 0.85, dot(vNormalLocal, normalize(uLight)));
    gl_FragColor = vec4(uRim, exp(-(1.0 - screenOffset(vNormalView)) / uWidth) * uStrength * lit * uOpacity);
  }
`;

// The halo: the soft bloom outside the disc, on a much larger back-facing shell.
//
// The obvious fresnel is wrong here. On a shell of radius k it peaks at *the shell's* limb, which is a ring floating out at k with
// nothing under it — the bloom has to peak at the globe's limb at 1 and fall off outward from there. Scaling screenOffset by the
// shell's radius puts it back into globe radii, so the falloff is measured against the edge it is supposed to hug.
export const haloVertex = /* glsl */ `
  varying vec3 vNormalView;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const haloFragment = /* glsl */ `
  uniform vec3 uHalo;
  uniform float uShell;
  uniform float uFalloff;
  uniform float uStrength;
  uniform float uOpacity;
  varying vec3 vNormalView;
  ${OFFSET}
  void main() {
    float offset = uShell * screenOffset(vNormalView);
    gl_FragColor = vec4(uHalo, exp(-max(0.0, offset - 1.0) * uFalloff) * uStrength * uOpacity);
  }
`;
