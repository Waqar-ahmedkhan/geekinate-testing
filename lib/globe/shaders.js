const OFFSET = `
  float screenOffset(vec3 normalView) {
    float axial = clamp(abs(normalView.z), 0.0, 1.0);
    return sqrt(max(0.0, 1.0 - axial * axial));
  }
`;

const SELECT = `
  uniform float uFocus;
  uniform float uPillar;
  float selected(float anchorA, float anchorB, float group) {
    float focused = step(abs(anchorA - uFocus), 0.5) + step(abs(anchorB - uFocus), 0.5);
    float pillared = step(abs(group - uPillar), 0.5);
    return clamp(focused + pillared, 0.0, 1.0);
  }
`;

export const oceanVertex = `
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vNormalLocal = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const oceanFragment = `
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

export const arcVertex = `
  attribute float aAlong;
  attribute float aSeed;
  attribute vec2 aEnds;
  attribute float aGroup;
  varying float vAlong;
  varying float vFacing;
  varying float vSeed;
  varying float vSelected;
  ${SELECT}
  void main() {
    vAlong = aAlong;
    vSeed = aSeed;
    vSelected = selected(aEnds.x, aEnds.y, aGroup);
    vFacing = normalize(normalMatrix * position).z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const arcFragment = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uBase;
  uniform float uOpacity;
  uniform vec3 uArc;
  uniform vec3 uHead;
  uniform vec2 uArcFade;
  varying float vAlong;
  varying float vFacing;
  varying float vSeed;
  varying float vSelected;
  void main() {
    float facing = smoothstep(uArcFade.x, uArcFade.y, vFacing);
    if (facing < 0.004) discard;
    float body = pow(sin(vAlong * 3.14159265), 0.7);
    float travel = fract(uTime * uSpeed * (1.0 + vSelected * 2.0) + vSeed);
    float lead = (vAlong - travel) * 16.0;
    float head = exp(-lead * lead);
    float strength = (uBase + head * 0.95) * (1.0 + vSelected * 1.6);
    gl_FragColor = vec4(mix(uArc, uHead, min(1.0, head + vSelected * 0.3)), min(1.0, body * strength) * uOpacity * facing);
  }
`;

export const flareVertex = `
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
    float local = fract(uTime * aSpeed + aPhase);
    float cycle = smoothstep(0.0, 0.06, local) * (1.0 - smoothstep(0.09, 0.42, local));
    vPulse = max(cycle, vSelected);
    vFacing = normalize(normalMatrix * position).z;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize * uPixelRatio * uScale * (0.25 + vPulse * 0.75) * (uCameraZ / -viewPosition.z);
  }
`;

export const flareFragment = `
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
    float across = exp(-abs(uv.y) * 24.0) * max(0.0, 1.0 - abs(uv.x));
    float down = exp(-abs(uv.x) * 24.0) * max(0.0, 1.0 - abs(uv.y));
    float star = core + (across + down) * 0.5;
    float mask = 1.0 - smoothstep(0.72, 1.0, radius);
    float alpha = star * mask * vPulse * clamp(vFacing * 3.0, 0.0, 1.0) * (1.0 + vSelected * 0.8);
    gl_FragColor = vec4(mix(uFlare, uCore, core), alpha * uOpacity);
  }
`;

export const rimVertex = `
  varying vec3 vNormalView;
  varying vec3 vNormalLocal;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    vNormalLocal = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const rimFragment = `
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

export const haloVertex = `
  varying vec3 vNormalView;
  void main() {
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const haloFragment = `
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
