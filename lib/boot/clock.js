export const sceneClock = { start: -1, cue: -1 };

export const cueSceneClock = (seconds) => {
  sceneClock.cue = seconds;
};

export function readSceneClock(time) {
  if (sceneClock.cue >= 0) {
    sceneClock.start = time - sceneClock.cue;
    sceneClock.cue = -1;
  }
  if (sceneClock.start < 0) sceneClock.start = time;
  return time - sceneClock.start;
}
