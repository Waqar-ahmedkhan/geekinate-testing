// GLSL for the two point clouds. Every per-particle decision is made here rather than on the CPU: 26,000 particles rewritten in JS
// each frame is a buffer upload per frame, while the same work in a vertex shader is free. Nothing in the scene ever touches a
// position array after mount.
//
// Written for ShaderMaterial, not RawShaderMaterial — three.js prepends `position`, `modelViewMatrix` and `projectionMatrix`, so
// they are used undeclared below on purpose.

export const cloudVertex = /* glsl */ `
  attribute vec3 aGlyph;
  attribute vec3 aSnake;
  attribute float aArc;
  attribute float aRand;
  attribute float aSeed;
  attribute float aTint;

  uniform float uTime;
  uniform float uForm;
  uniform float uPose;
  uniform float uCrawl;
  uniform float uWaves;
  uniform float uWaveAmp;
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

  varying float vTint;
  varying float vHot;

  void main() {
    // position is the scattered cloud and aGlyph the letterform, so uForm reads as how assembled the mark is — 1 in the hero, 0
    // through the middle of the page, 1 again at the footer. Each particle owns a slice of that range rather than all of them
    // sharing it; without the stagger the two poses cross-fade in lockstep and it reads as a tween instead of a gathering.
    // (No backticks anywhere in this file: the shaders are template literals and a backtick in a comment closes the string.)
    float head = aRand * uSpread;
    float t = clamp((uForm - head) / max(1.0 - uSpread, 0.0001), 0.0, 1.0);
    float eased = t * t * (3.0 - 2.0 * t);

    // The body is sampled straight and bent here. One travelling sine along the arc gives both the serpentine and the crawl — at
    // phase zero it is already an S, and advancing the phase moves the wave down the body, which is what slithering is. Bending it on
    // the CPU instead would mean rewriting every position every frame along a curve whose arc length keeps changing under it.
    vec3 body = aSnake;
    // Minus, with the head at the tail end of the arc. A snake propagates its wave from head to tail and travels head-first, so the
    // pattern has to run UP the screen for the body to read as going down it. Flipping this to plus makes the bumps travel downward
    // and the whole animal then reads as being pushed backwards, up the page — which is the same wrongness, mirrored.
    body.x += sin(aArc * uWaves * 6.2831853 - uCrawl) * uWaveAmp;
    // uPose picks which assembled shape is being held: the snake through the middle of the page, the letterform at both ends. The
    // swap happens while uForm is at its lowest, so the two shapes never cross-fade in view — the cloud is between them.
    vec3 shape = mix(body, aGlyph, uPose);
    vec3 pos = mix(position, shape, eased);

    // Drift scales down as the mark assembles. A letterform that keeps swimming cannot be read, and a cloud that holds still stops
    // looking like particles.
    float phase = uTime * uDriftSpeed + aSeed * 6.2831853;
    pos += vec3(sin(phase), cos(phase * 1.13), sin(phase * 0.71)) * uDrift * mix(uDriftLoose, 1.0, eased);

    pos *= uScale;

    // Both rotations happen here, about the mark's own centre, and only then is it moved sideways. Rotating the object itself
    // instead turns about the world origin, and an object sitting three units to the right swings through an arc — the pointer tilt
    // read as the mark lurching across the screen rather than turning in place.
    //
    // uFaceYaw is not an effect. A flat mark parked off the camera axis is seen at an angle, and its own depth then shears sideways
    // under perspective: at this offset the near and far particles separate by tens of pixels and the whole letterform reads as
    // rotated even with the pointer dead centre. Yawing it to face the camera puts that depth along the view ray, where it belongs.
    float yaw = uTilt.y + uFaceYaw;
    pos = vec3(pos.x * cos(yaw) + pos.z * sin(yaw), pos.y, pos.z * cos(yaw) - pos.x * sin(yaw));
    pos = vec3(pos.x, pos.y * cos(uTilt.x) - pos.z * sin(uTilt.x), pos.y * sin(uTilt.x) + pos.z * cos(uTilt.x));
    pos.x += uOffsetX;
    pos.y += uBob;

    // Pointer attraction. The target is smeared per particle along the segment the pointer has just travelled — that is the whole
    // trick behind the comet: aim every particle at the same point and it is a blob, aim them along the path and it is a streak.
    vec3 target = mix(uPointerTrail, uPointer, aRand);
    vec3 toTarget = target - pos;
    float pull = smoothstep(uPullRadius, 0.0, length(toTarget)) * uPullStrength * uPointerActive;
    vec3 swirled = vec3(-toTarget.y, toTarget.x, 0.0) * uSwirl;
    pos += (toTarget + swirled) * pull;

    vTint = aTint;
    vHot = pull;

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    // Sized in CSS pixels at the subject plane, then attenuated by depth. Dividing by uCameraZ makes uSize mean "pixels at rest",
    // which is a number that can be judged against a screenshot instead of guessed.
    gl_PointSize = uSize * uPixelRatio * uScale * (uCameraZ / -viewPosition.z) * (1.0 + pull * 1.1);
  }
`;

export const cloudFragment = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uVolt;
  uniform float uGloss;
  uniform float uOpacity;

  varying float vTint;
  varying float vHot;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);
    if (dist > 0.5) discard;
    // Soft edge, solid core. A hard disc aliases badly at these sizes, but a falloff that starts at the centre turns every particle
    // into a smudge and the letterform into fog — this holds full opacity to 60% of the radius and only feathers the rim.
    float alpha = smoothstep(0.5, 0.3, dist);
    // Volt is the body of the mark and vTint lifts a minority of particles toward paper, so the cloud has highlights in it rather
    // than reading as one flat green.
    vec3 color = mix(uVolt, uPaper, vTint);
    // A hot core on every bead, brightest at its centre and gone by the rim. This is the whole gloss: a cloud of small spheres lit
    // from the front, rather than a stencil filled with a solid colour.
    color = mix(color, uPaper, pow(max(0.0, 1.0 - dist * 2.4), 3.0) * uGloss);
    // Particles caught by the cursor flare white, which is the other way round from before — on a volt body the accent to reach for
    // is the light, not more of the same green.
    color = mix(color, uPaper, vHot * 0.5);
    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;

export const fieldVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aTint;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uDepth;
  uniform float uNear;
  uniform float uSize;
  uniform float uCameraZ;
  uniform float uPixelRatio;

  varying float vTint;
  varying float vTwinkle;

  void main() {
    // The whole point of this shader. The field travels toward the camera and wraps, which is what makes the page feel like it is
    // moving forward through space instead of parked in front of a photograph of it. The sampled z is thrown away and replaced by a
    // seeded offset into the run, so the stars stay evenly spread along it rather than arriving in waves.
    //
    // mod on a rising value is the whole recycling mechanism: no buffer is rewritten, no star is respawned on the CPU, and there is
    // no state to get out of step when a tab is backgrounded and the clock jumps.
    float span = uDepth + uNear;
    float travel = mod(aSeed * span + uTime * uSpeed, span);
    vec3 pos = vec3(position.xy, -uDepth + travel);
    float life = travel / span;
    vTint = aTint;
    // Every star on its own phase, so the field never pulses in unison. Faded at both ends of the run, because a star appearing out
    // of nothing at the far plane is a pop and one vanishing at the near plane is a bigger one.
    float twinkle = 0.45 + 0.55 * (0.5 + 0.5 * sin(uTime * 1.7 + aSeed * 40.0));
    vTwinkle = twinkle * smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.86, 1.0, life));
    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize * uPixelRatio * (uCameraZ / -viewPosition.z);
  }
`;

export const fieldFragment = /* glsl */ `
  uniform vec3 uPaper;
  uniform vec3 uVolt;
  uniform float uOpacity;

  varying float vTint;
  varying float vTwinkle;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(mix(uPaper, uVolt, vTint), alpha * vTwinkle * uOpacity);
  }
`;
