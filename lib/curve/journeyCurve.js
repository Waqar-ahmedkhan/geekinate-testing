import { CatmullRomCurve3, Vector3 } from 'three';
import { SNAKE } from '@/constants';

// Region B: the path the head travels between leaving the letterform and rejoining it. The waypoints are a design choice and live
// in constants; the two lead points are not, and this is the only reason this file exists.
//
// A Catmull-Rom's tangent at a point comes from its neighbours, so leaving Region A without a kink means putting the first journey
// point on the letterform's own end tangent. That tangent is **not** +x. The shallow sine in Z tilts it about seven degrees out of
// plane at both ends, and a lead placed along +x instead concentrates those seven degrees at a single point — measured at 1110
// degrees per unit of arc, against the letterform's own corners at 410. Reading the tangent off the curve drops it to 32.
//
// The mistake is invisible in a screenshot and looks like a shading seam rather than a crease, which is why it is worth measuring
// rather than eyeballing.
export const createJourneyCurve = (gCurve) => {
  const head = gCurve.getPointAt(1, new Vector3()),
    tail = gCurve.getPointAt(0, new Vector3());
  const outward = gCurve.getTangentAt(1, new Vector3()),
    inward = gCurve.getTangentAt(0, new Vector3());
  // Two different lead lengths, because the two ends cost different things. The head's lead runs +x into empty frame on the right
  // and can afford to be long enough to turn gently. The tail's runs -x and is the single furthest-left point on the whole spine,
  // so every unit of it drags the composition back toward the middle of the screen; it is kept as short as the join tolerates.
  const waypoints = SNAKE.journey.map(({ position }) => new Vector3(...position));
  const lead = [head.clone().addScaledVector(outward, SNAKE.journeyLead), tail.clone().addScaledVector(inward, -SNAKE.journeyLeadTail)];
  return new CatmullRomCurve3([head, lead[0], ...waypoints, lead[1], tail], false, 'centripetal');
};
