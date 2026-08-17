// How much resolution the scene is allowed to ask for, decided by what the machine actually delivers rather than by what it claims.
//
// This scene is fill-rate bound, not vertex bound — the globe's three additive shells alone cover more than a screen of blended
// fragments, and the 26,000 sprites are drawn over the top of them. Fragment cost scales with the *square* of the device pixel
// ratio, so a 2x display is four times the work of a 1x one for a difference nobody can name on a 4px bead. That makes resolution
// the one lever that buys a low-end laptop a real frame rate without touching the composition: dropping the count instead would
// break the coastlines, which is a design decision, and dropping the shells would remove the atmosphere.
//
// **It only ever steps down.** Stepping back up when a machine recovers sounds fairer and is worse: changing the ratio reallocates
// every buffer in the renderer, so an oscillating governor is a visible hitch on a loop. Monotonic means the worst thing that can
// happen is a machine that stuttered once stays a little softer than it had to.
const STEPS = [2, 1.5, 1.25, 1];
// Below 45fps something is wrong; a frame budget of 22ms is that line. Measured as a mean over a window rather than per frame so a
// single garbage collection or a video keyframe cannot cost the page its resolution.
const BUDGET_MS = 22;
const WINDOW_MS = 1000;
// The first second is shader compilation, font swap, hydration and the first video decodes landing on top of each other. Judging
// the machine on that window would demote every device on the internet.
const GRACE_MS = 1500;
// A frame this long is not a slow frame, it is a stall — a tab coming back to the foreground, a breakpoint, a system hiccup. Folding
// it into the mean would drag an otherwise healthy machine down a step for something that already ended.
const STALL_MS = 200;

// Where a machine starts, before it has rendered anything. Only the unambiguous signals are read: a low core count is the one
// property that reliably separates a netbook from a workstation, and `deviceMemory` is the other, where it exists at all. Anything
// subtler than this is guesswork the governor below is about to measure properly anyway.
const startingStep = () => {
  if (typeof navigator === 'undefined') return 0;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  if (cores <= 2 || memory <= 2) return 2;
  if (cores <= 4 || memory <= 4) return 1;
  return 0;
};

// Never above the display's own ratio. The steps are a ceiling on what the scene may ask for, not a resolution to render at: a 1x
// laptop asked to draw at 1.5 would supersample itself and land slower than it started, which is the exact opposite of the point.
const deviceRatio = () => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);
const ratioFor = (step) => Math.min(deviceRatio(), STEPS[step]);

export function createGovernor() {
  let step = startingStep(),
    elapsed = 0,
    windowMs = 0,
    frames = 0;
  let applied = ratioFor(step);
  // Returns the ratio to render at, or 0 for "no change" — so the caller only ever touches the renderer on the frames that matter.
  return (delta) => {
    const ms = delta * 1000;
    elapsed += ms;
    if (elapsed < GRACE_MS || step >= STEPS.length - 1 || ms > STALL_MS) return 0;
    windowMs += ms;
    frames += 1;
    if (windowMs < WINDOW_MS) return 0;
    const mean = windowMs / frames;
    windowMs = 0;
    frames = 0;
    if (mean <= BUDGET_MS) return 0;
    step += 1;
    const next = ratioFor(step);
    // On a 1x display every step clamps to the same 1, so the demotion is real but there is nothing to hand the renderer. Saying so
    // keeps the caller from reallocating every buffer it owns to arrive at the resolution it is already drawing.
    if (next === applied) return 0;
    applied = next;
    return next;
  };
}

export const startingDpr = () => ratioFor(startingStep());
