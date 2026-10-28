export const sceneClock = { start: -1 };

export function readSceneClock(time) {
  if (sceneClock.start < 0) sceneClock.start = time;
  return time - sceneClock.start;
}
