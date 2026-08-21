import { CatmullRomCurve3, Vector3 } from 'three';
import { SNAKE } from '@/constants';

export const createJourneyCurve = (gCurve) => {
  const head = gCurve.getPointAt(1, new Vector3()),
    tail = gCurve.getPointAt(0, new Vector3());
  const outward = gCurve.getTangentAt(1, new Vector3()),
    inward = gCurve.getTangentAt(0, new Vector3());
  const waypoints = SNAKE.journey.map(({ position }) => new Vector3(...position));
  const lead = [head.clone().addScaledVector(outward, SNAKE.journeyLead), tail.clone().addScaledVector(inward, -SNAKE.journeyLeadTail)];
  return new CatmullRomCurve3([head, lead[0], ...waypoints, lead[1], tail], false, 'centripetal');
};
