// GLSL for the two point clouds. Every per-particle decision is made here rather than on the CPU: 26,000 particles rewritten in JS
// each frame is a buffer upload per frame, while the same work in a vertex shader is free. Nothing in the scene ever touches a
// position array after mount.
//
// Written for ShaderMaterial, not RawShaderMaterial — three.js prepends `position`, `modelViewMatrix` and `projectionMatrix`, so
// they are used undeclared below on purpose.

export const cloudVertex = /* glsl */ `
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

  // The mark's two rotations, factored out because the normal has to take exactly the same pair. A normal rotated by anything other
  // than what moved the surface lights a shape that is not on screen — and the pointer tilt makes that obvious immediately, because
  // the shading would slide the wrong way as the mark turns. Uniform scale does not affect a normal, so scale stays out of it.
  vec3 orient(vec3 value, float yaw, float pitch) {
    vec3 turned = vec3(value.x * cos(yaw) + value.z * sin(yaw), value.y, value.z * cos(yaw) - value.x * sin(yaw));
    return vec3(turned.x, turned.y * cos(pitch) - turned.z * sin(pitch), turned.y * sin(pitch) + turned.z * cos(pitch));
  }

  void main() {
    // position is the scattered cloud and aGlyph the letterform, so uForm reads as how assembled the mark is — 1 in the hero, 0
    // through the middle of the page, 1 again at the footer. Each particle owns a slice of that range rather than all of them
    // sharing it; without the stagger the two poses cross-fade in lockstep and it reads as a tween instead of a gathering.
    // (No backticks anywhere in this file: the shaders are template literals and a backtick in a comment closes the string.)
    float head = aRand * uSpread;
    float t = clamp((uForm - head) / max(1.0 - uSpread, 0.0001), 0.0, 1.0);
    float eased = t * t * (3.0 - 2.0 * t);
    // The same stagger against the globe's own progress, so the world gathers and comes apart the way the letterform does rather
    // than inflating and deflating in lockstep.
    float g = clamp((uGlobeMix - head) / max(1.0 - uSpread, 0.0001), 0.0, 1.0);
    float globe = g * g * (3.0 - 2.0 * g);

    // Three poses in one buffer, and only ever two of them in play at once. position is the scattered cloud, aGlyph the
    // letterform, aGlobe a point on the unit sphere where the land is. uForm opens and closes around the mark in the footer;
    // uGlobeMix opens and closes around the Earth in the hero; the scattered cloud is what the page holds between them, which is
    // why it is the pose both of the others are mixed *against*.
    vec3 shaped = mix(position, aGlyph, eased);

    // Drift scales down as the mark assembles. A letterform that keeps swimming cannot be read, and a cloud that holds still stops
    // looking like particles.
    float phase = uTime * uDriftSpeed + aSeed * 6.2831853;
    shaped += vec3(sin(phase), cos(phase * 1.13), sin(phase * 0.71)) * uDrift * mix(uDriftLoose, 1.0, eased);

    shaped *= uScale;

    // Both rotations happen here, about the mark's own centre, and only then is it moved sideways. Rotating the object itself
    // instead turns about the world origin, and an object sitting three units to the right swings through an arc — the pointer tilt
    // read as the mark lurching across the screen rather than turning in place.
    //
    // uFaceYaw is not an effect. A flat mark parked off the camera axis is seen at an angle, and its own depth then shears sideways
    // under perspective: at this offset the near and far particles separate by tens of pixels and the whole letterform reads as
    // rotated even with the pointer dead centre. Yawing it to face the camera puts that depth along the view ray, where it belongs.
    // uSpin rides on the same axis as the face-on correction, so the mark turns about its own vertical rather than swinging through
    // an arc — and because the normal takes the identical rotation below, the light stays put while the surface moves under it,
    // which is the whole reason a turn reads as solid.
    float yaw = uTilt.y + uFaceYaw + uSpin;
    vec3 markPos = orient(shaped, yaw, uTilt.x);
    vec3 markNormal = orient(aNormal, yaw, uTilt.x);
    markPos.x += uOffsetX;
    markPos.y += uBob;

    // The globe's own frame, and it deliberately shares nothing with the mark's. Spin about the sphere's vertical, lean the result
    // by the axial tilt, then push it out to radius and drop the centre below the frame. Doing this here rather than by
    // transforming the object is what lets one cloud hold a spinning world and a still letterform at the same time.
    //
    // aGlobe is a unit vector, so the transformed copy is both the position on the sphere and the surface normal there. Nothing
    // needs a second attribute for it.
    vec3 spun = orient(aGlobe, uGlobeSpin, 0.0);
    float lean = cos(uGlobeTilt), rise = sin(uGlobeTilt);
    vec3 globeNormal = vec3(spun.x * lean - spun.y * rise, spun.x * rise + spun.y * lean, spun.z);
    vec3 globePos = globeNormal * uGlobeRadius + vec3(0.0, uGlobeY, 0.0);

    vec3 pos = mix(markPos, globePos, globe);
    vNormal = normalize(mix(markNormal, globeNormal, globe));
    // How much of a surface there is to light: all of it on the globe, all of it on an assembled letterform, none of it while the
    // particles are a loose cloud with no face, where each one falls back to being lit as its own bead.
    vSolid = mix(eased, 1.0, globe);
    // The globe's entire occlusion strategy. Nothing in this scene depth-tests, so the far side of the sphere would otherwise draw
    // straight through the near side and the world would collapse into a flat tangle. A sphere can hide its own back by simply not
    // drawing it, and the window is narrow enough that the field ends *at* the silhouette rather than thinning toward it.
    // Two fades on one varying, because they are never both in play: the globe's far side, and the particles the letterform is not
    // made of. member is 1 for everything while the cloud is scattered and falls to aMark as the mark assembles, so the extra beads
    // leave with the pose rather than popping out of it — and the globe is mixed to full brightness over the top, which is why its
    // own count is untouched by the mark's.
    float member = mix(1.0, aMark, eased);
    vFade = mix(member, smoothstep(uGlobeFade.x, uGlobeFade.y, globeNormal.z), globe);

    // Pointer attraction. The target is smeared per particle along the segment the pointer has just travelled — that is the whole
    // trick behind the comet: aim every particle at the same point and it is a blob, aim them along the path and it is a streak.
    //
    // Faded out in the globe pose, and replaced below rather than retuned. A 3D radius against a sphere eight units deep only ever
    // reaches the handful of particles nearest the camera, so the cursor appeared to do nothing over most of the world.
    vec3 target = mix(uPointerTrail, uPointer, aRand);
    vec3 toTarget = target - pos;
    float pull = smoothstep(uPullRadius, 0.0, length(toTarget)) * uPullStrength * uPointerActive * (1.0 - globe);
    vec3 swirled = vec3(-toTarget.y, toTarget.x, 0.0) * uSwirl;
    pos += (toTarget + swirled) * pull;

    // The globe's answer to the cursor: measured on screen, applied along the surface normal. The land peels off the sphere under
    // the pointer and settles back behind it, which is the same gesture as the mark's comet read on a curved surface — a pull
    // *across* a sphere would just slide the map about.
    float reach = length(pos.xy - uPointer.xy);
    float lift = smoothstep(uLiftRadius, 0.0, reach) * uPointerActive * globe;
    pos += globeNormal * lift * uLift;

    vTint = aTint;
    vHot = max(pull, lift);

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    // Sized in CSS pixels at the subject plane, then attenuated by depth. Dividing by uCameraZ makes the size uniforms mean "pixels
    // at rest", which is a number that can be judged against a screenshot instead of guessed. The globe carries its own scale in
    // uGlobeRadius, so uScale drops out of its half of the mix or the land would be sized twice.
    gl_PointSize =
      mix(uSize, uGlobeSize, globe) * uPixelRatio * mix(uScale, 1.0, globe) * (uCameraZ / -viewPosition.z) * (1.0 + vHot * 1.1);
  }
`;

export const cloudFragment = /* glsl */ `
  // Not paper. Every light in here — the tint, the specular core, the cursor flare — used to be the page's white, which is exactly
  // right over the black hero and completely invisible over the paper wash the hero now carries: the mark flattened into a solid
  // green stencil and the tinted minority turned into holes. uHighlight is that same light, swung to ink while the ground is light,
  // so the beads are shaded rather than lit and the gloss survives both grounds. Driven from MorphCloud.
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

  // Above, in front, and off to the left. Written already normalised because a const initialiser in GLSL ES 1.0 has to be a constant
  // expression, which rules out calling normalize on it.
  const vec3 LIGHT = vec3(-0.421, 0.621, 0.661);

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);
    if (dist > 0.5) discard;
    // Soft edge, solid core. A hard disc aliases badly at these sizes, but a falloff that starts at the centre turns every particle
    // into a smudge and the letterform into fog — this holds full opacity to 60% of the radius and only feathers the rim.
    float alpha = smoothstep(0.5, 0.3, dist);

    // Two normals, and the difference between them is the difference between a bead and a letter. The bead normal treats this sprite
    // as a little sphere and varies across its own eight pixels; the surface normal is the mark's own face and varies across the
    // whole glyph. Only the second one can make a stroke read as round, because only it knows where the stroke's centre line is.
    // Lighting by the bead alone — which is all this had — gives every particle an identical highlight at its own centre, and a field
    // of identical beads is exactly what reads as flat however much depth the geometry actually carries.
    vec2 planar = offset * 2.0;
    vec3 bead = vec3(planar, sqrt(max(0.0001, 1.0 - min(1.0, dot(planar, planar)))));
    // Just over half, not three quarters. The surface normal is the same across every particle in a cross-section of a stroke, so
    // the more of it there is in this mix the more the stroke bands: one tone at the crest, another at each rim. At 0.74 the mark
    // read as a row of moulded tubes rather than as a dense field of beads that happens to be rounded.
    vec3 normal = normalize(mix(bead, normalize(vNormal), 0.52 * vSolid));

    // Wrapped rather than clamped. A true Lambert term takes the unlit side to black, and a black particle on the hero's paper
    // ground reads as a hole punched through the mark rather than as its shaded side.
    // Wrapped and biased up, not the textbook 0.5 + 0.5 * dot. That form centres on 0.5, which puts the *average* particle halfway
    // to the shade colour — the letterform came out a muddy forest green and the snake, whose beads face every direction at once,
    // came out darker still against the black sections. Biasing to 0.62 keeps volt as the body of the mark and spends the shading
    // either side of it, which is the difference between lighting a volt object and quietly repainting it a darker green.
    //
    // Squaring the term was tried in the same place and is the same mistake with a steeper curve.
    float lambert = clamp(0.7 + 0.42 * dot(normal, LIGHT), 0.0, 1.0);
    vec3 color = mix(uShade, uVolt, lambert);
    // The full tint, not a fraction of it. On the hero's paper ground uHighlight is ink, so a particle at vTint = 1 is a black dot —
    // and those black dots are a large part of what the mark looks like. Scaling this to 0.55 turned every one of them into a mid
    // green, which is why the grit disappeared: the dots were all still there, none of them were dark enough to see.
    color = mix(color, uHighlight, vTint);
    // A core in every bead, dark on paper and light on the void, brightest at the centre and gone by the rim. This is what makes a
    // bead a bead. Directional lighting replaced it and the mark went soft: without a core each particle is a flat disc with a
    // feathered edge, and twenty thousand of those merge into a haze instead of reading as individual grains.
    color = mix(color, uHighlight, pow(max(0.0, 1.0 - dist * 2.4), 3.0) * uCore);
    // The specular, against the view direction — which is +z here, because the mark is yawed to face the camera. Kept in the green
    // family rather than run to white: a white speck on every bead is the thing that was taken off the background field, and it
    // reads the same way on the mark.
    //
    // The exponent has been wrong in both directions. At 22 the sheen never fired — the surface reflects the light down the view ray
    // along one contour of the stroke, and that contour was thinner than a bead. At 8 it fired far too wide: a pale band ran the
    // length of every stroke and the letterform read as hollowed out rather than solid. 18 is a glint on the beads that catch it.
    float spec = pow(max(0.0, dot(reflect(-LIGHT, normal), vec3(0.0, 0.0, 1.0))), 18.0);
    color = mix(color, uSheen, spec * uGloss);
    // Particles caught by the cursor flare off the body, which is the other way round from before — on a volt body the accent to
    // reach for is the contrast, not more of the same green.
    color = mix(color, uHighlight, vHot * 0.5);
    // vFade is 1 everywhere except on the globe's far side — see the note in the vertex shader. Discarding the fully faded ones
    // saves the blend, and matters here because half of twenty-six thousand sprites is a lot of fragments to throw away late.
    if (vFade < 0.004) discard;
    gl_FragColor = vec4(color, alpha * uOpacity * vFade);
  }
`;
