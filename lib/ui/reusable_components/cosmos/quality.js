const STEPS = [2, 1.5, 1.25, 1];
const BUDGET_MS = 22;
const WINDOW_MS = 1000;
const GRACE_MS = 1500;
const STALL_MS = 200;

const startingStep = () => {
  if (typeof navigator === 'undefined') return 0;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = navigator.deviceMemory || 8;
  if (cores <= 2 || memory <= 2) return 2;
  if (cores <= 4 || memory <= 4) return 1;
  return 0;
};

const deviceRatio = () => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1);
const ratioFor = (step) => Math.min(deviceRatio(), STEPS[step]);

export function createGovernor() {
  let step = startingStep(),
    elapsed = 0,
    windowMs = 0,
    frames = 0;
  let applied = ratioFor(step);
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
    if (next === applied) return 0;
    applied = next;
    return next;
  };
}

export const startingDpr = () => ratioFor(startingStep());
