// The substrate: a coarse grid of cells running a Life-like rule, seeded by the mark.
//
// It replaced a starfield, which was the wrong idea for this site — space says nothing about what Geekinate does, and a drifting
// starfield is the single most common background on the web. Cellular automata say the thing the site is actually about: simple
// rules, run continuously, producing behaviour nobody wrote by hand. It is also, literally, a game.
//
// Only the display lives here. The rule itself runs on the CPU in automata.js, for the reasons set out there.
//
// The mark is not decoration on top of it. The G and the snake stamp living cells wherever they pass, and those cells then live and
// die on their own — so the background is the mark's wake rather than a layer behind it.
//
// (No backticks anywhere in this file: the shaders are template literals and a backtick in a comment closes the string.)

// The display plane is a real object in the page's scene, sized to cover the frustum at its own depth, so it projects normally.
export const viewVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// What is actually seen: one dot per cell, brightness from the afterglow. Dots rather than filled squares because the mark itself is
// a cloud of dots — the background has to be made of the same stuff, or it reads as a texture the mark is pasted onto.
export const viewFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uState;
  uniform vec2 uGrid;
  uniform vec2 uOffset;
  uniform vec3 uVolt;
  uniform vec3 uPaper;
  uniform float uDotSize;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // No fract here on purpose. The state texture repeats and the rule is toroidal, so letting the coordinate run past 1 slides the
    // whole lattice seamlessly — fract would wrap it and put a visible seam across the page.
    vec2 grid = (vUv + uOffset) * uGrid;
    vec2 cell = floor(grid);
    float glow = texture2D(uState, (cell + 0.5) / uGrid).g;
    float dot = smoothstep(uDotSize, uDotSize * 0.35, length(fract(grid) - 0.5));
    // The hottest cells run toward paper, so a fresh birth reads as a spark and the long tail of the afterglow stays volt.
    gl_FragColor = vec4(mix(uVolt, uPaper, glow * glow * 0.4), dot * glow * uOpacity);
  }
`;
