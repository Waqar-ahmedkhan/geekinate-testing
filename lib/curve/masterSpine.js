import { CatmullRomCurve3 } from 'three';
import { createGCurve, createGPoints, gArcLength, gSpacing } from './gCurve';
import { createJourneyCurve } from './journeyCurve';
import { SNAKE } from '@/constants';

export const createMasterSpine = () => {
  const letterform = createGPoints();
  const journey = createJourneyCurve(createGCurve());
  const between = journey.getSpacedPoints(Math.max(2, Math.round(journey.getLength() / gSpacing))).slice(1, -1);
  const curve = new CatmullRomCurve3([...letterform, ...between, ...createGPoints()], false, 'centripetal');
  curve.arcLengthDivisions = SNAKE.arcLengthDivisions;
  return { curve, window: Math.min(1, (gArcLength * SNAKE.windowSlack) / curve.getLength()) };
};

export const getWindowPoints = (curve, progress, windowFraction, points) => {
  const start = progress * (1 - windowFraction);
  const last = points.length - 1;
  points.forEach((point, index) => curve.getPointAt(Math.min(1, start + (index / last) * windowFraction), point));
  return points;
};
