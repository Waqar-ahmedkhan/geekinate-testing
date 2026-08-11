import { CatmullRomCurve3 } from 'three';
import { createGCurve, createGPoints, gArcLength, gSpacing } from './gCurve';
import { createJourneyCurve } from './journeyCurve';
import { SNAKE } from '@/constants';

// Region A, then B, then C, as one continuous curve — the letterform, the journey, the letterform again. Deliberately not a morph
// between two shapes: a fixed-arc-length window slides along this spine and both the unravel and the reassembly fall out of that
// for nothing. At progress 0 the window sits over Region A and reads as the mark; at 1 it has slid onto Region C and reads as the
// mark again; in between the head has left the letterform while the tail is still inside it.
//
// The journey is resampled to the letterform's own point spacing before being concatenated. Without that the spine jumps from a
// 0.012 gap between points to a 0.28 one at the seam, and a Catmull-Rom answers a spacing jump like that with an overshoot exactly
// where the tube most needs to look continuous.
export const createMasterSpine = () => {
  const letterform = createGPoints();
  const journey = createJourneyCurve(createGCurve());
  const between = journey.getSpacedPoints(Math.max(2, Math.round(journey.getLength() / gSpacing))).slice(1, -1);
  const curve = new CatmullRomCurve3([...letterform, ...between, ...createGPoints()], false, 'centripetal');
  // Set before anything queries a length — the first getLength call caches the table this number sizes.
  curve.arcLengthDivisions = SNAKE.arcLengthDivisions;
  return { curve, window: Math.min(1, (gArcLength * SNAKE.windowSlack) / curve.getLength()) };
};

// Arc-length parameterised through getPointAt, not uniform t: the head has to travel at a constant rate rather than sprinting the
// straights and stalling in the corners. Writes into the caller's Vector3 pool so a per-frame window costs no allocation.
export const getWindowPoints = (curve, progress, windowFraction, points) => {
  const start = progress * (1 - windowFraction);
  const last = points.length - 1;
  points.forEach((point, index) => curve.getPointAt(Math.min(1, start + (index / last) * windowFraction), point));
  return points;
};
