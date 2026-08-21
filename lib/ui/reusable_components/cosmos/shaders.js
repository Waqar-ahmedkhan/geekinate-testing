export const cloudVertex = `
  attribute vec3 aGlyph;
  attribute vec3 aGlobe;
  attribute vec3 aNormal;
  attribute float aMark;
  attribute float aRand;
  attribute float aSeed;
  attribute float aTint;

  uniform float uTime;
  uniform float uForm;
  uniform float uSpin;
  uniform float uOffsetX;
  uniform float uBob;
  uniform vec2 uTilt;
  uniform float uFaceYaw;
  uniform float uSpread;
  uniform float uDrift;
  uniform float uDriftLoose;
  uniform float uDriftSpeed;
  uniform vec3 uPointer;
  uniform vec3 uPointerTrail;
  uniform float uPointerActive;
  uniform float uPullRadius;
  uniform float uPullStrength;
  uniform float uSwirl;
  uniform float uSize;
  uniform float uScale;
  uniform float uCameraZ;
  uniform float uPixelRatio;
  uniform float uGlobeMix;
  uniform float uGlobeRadius;
  uniform float uGlobeY;
  uniform float uGlobeSpin;
  uniform float uGlobeTilt;
  uniform float uGlobeSize;
  uniform vec2 uGlobeFade;
  uniform float uLift;
  uniform float uLiftRadius;

  varying float vTint;
  varying float vHot;
  varying vec3 vNormal;
  varying float vSolid;
  varying float vFade;

  vec3 orient(vec3 value, float yaw, float pitch) {
    vec3 turned = vec3(value.x * cos(yaw) + value.z * sin(yaw), value.y, value.z * cos(yaw) - value.x * sin(yaw));
    return vec3(turned.x, turned.y * cos(pitch) - turned.z * sin(pitch), turned.y * sin(pitch) + turned.z * cos(pitch));
  }

  void main() {
    float head = aRand * uSpread;
    float t = clamp((uForm - head) / max(1.0 - uSpread, 0.0001), 0.0, 1.0);
    float eased = t * t * (3.0 - 2.0 * t);
    float g = clamp((uGlobeMix - head) / max(1.0 - uSpread, 0.0001), 0.0, 1.0);
    float globe = g * g * (3.0 - 2.0 * g);

    vec3 shaped = mix(position, aGlyph, eased);

    float phase = uTime * uDriftSpeed + aSeed * 6.2831853;
    shaped += vec3(sin(phase), cos(phase * 1.13), sin(phase * 0.71)) * uDrift * mix(uDriftLoose, 1.0, eased);

    shaped *= uScale;

    float yaw = uTilt.y + uFaceYaw + uSpin;
    vec3 markPos = orient(shaped, yaw, uTilt.x);
    vec3 markNormal = orient(aNormal, yaw, uTilt.x);
    markPos.x += uOffsetX;
    markPos.y += uBob;

    vec3 spun = orient(aGlobe, uGlobeSpin, 0.0);
    float lean = cos(uGlobeTilt), rise = sin(uGlobeTilt);
    vec3 globeNormal = vec3(spun.x * lean - spun.y * rise, spun.x * rise + spun.y * lean, spun.z);
    vec3 globePos = globeNormal * uGlobeRadius + vec3(0.0, uGlobeY, 0.0);

    vec3 pos = mix(markPos, globePos, globe);
    vNormal = normalize(mix(markNormal, globeNormal, globe));
    vSolid = mix(eased, 1.0, globe);
    float member = mix(1.0, aMark, eased);
    vFade = mix(member, smoothstep(uGlobeFade.x, uGlobeFade.y, globeNormal.z), globe);

    vec3 target = mix(uPointerTrail, uPointer, aRand);
    vec3 toTarget = target - pos;
    float pull = smoothstep(uPullRadius, 0.0, length(toTarget)) * uPullStrength * uPointerActive * (1.0 - globe);
    vec3 swirled = vec3(-toTarget.y, toTarget.x, 0.0) * uSwirl;
    pos += (toTarget + swirled) * pull;

    float reach = length(pos.xy - uPointer.xy);
    float lift = smoothstep(uLiftRadius, 0.0, reach) * uPointerActive * globe;
    pos += globeNormal * lift * uLift;

    vTint = aTint;
    vHot = max(pull, lift);

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize =
      mix(uSize, uGlobeSize, globe) * uPixelRatio * mix(uScale, 1.0, globe) * (uCameraZ / -viewPosition.z) * (1.0 + vHot * 1.1);
  }
`;

export const cloudFragment = `
  uniform vec3 uHighlight;
  uniform vec3 uVolt;
  uniform vec3 uShade;
  uniform vec3 uSheen;
  uniform float uCore;
  uniform float uGloss;
  uniform float uOpacity;

  varying float vTint;
  varying float vHot;
  varying vec3 vNormal;
  varying float vSolid;
  varying float vFade;

  const vec3 LIGHT = vec3(-0.421, 0.621, 0.661);

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.3, dist);

    vec2 planar = offset * 2.0;
    vec3 bead = vec3(planar, sqrt(max(0.0001, 1.0 - min(1.0, dot(planar, planar)))));
    vec3 normal = normalize(mix(bead, normalize(vNormal), 0.52 * vSolid));

    float lambert = clamp(0.7 + 0.42 * dot(normal, LIGHT), 0.0, 1.0);
    vec3 color = mix(uShade, uVolt, lambert);
    color = mix(color, uHighlight, vTint);
    color = mix(color, uHighlight, pow(max(0.0, 1.0 - dist * 2.4), 3.0) * uCore);
    float spec = pow(max(0.0, dot(reflect(-LIGHT, normal), vec3(0.0, 0.0, 1.0))), 18.0);
    color = mix(color, uSheen, spec * uGloss);
    color = mix(color, uHighlight, vHot * 0.5);
    if (vFade < 0.004) discard;
    gl_FragColor = vec4(color, alpha * uOpacity * vFade);
  }
`;
