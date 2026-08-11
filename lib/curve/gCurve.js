import { CatmullRomCurve3, Vector3 } from 'three';
import gPoints from './g-points.json';
import { SNAKE } from '@/constants';

// The baked centreline is planar. A shallow sine along its own arc length gives the letterform something for a highlight to travel
// across without disturbing the silhouette that makes it read as the mark.
const depthAt = (index, count) => Math.sin((index / (count - 1)) * Math.PI * 2 * SNAKE.waveCycles) * SNAKE.waveDepth;

// Bake order stands, so the head is the bar tip inside the bowl — the upper line. Reversing it to start from the bottom spur was
// tried and reverted: the spur's end tangent points -x, so the head swings left before it can turn down and the ribbon crosses the
// middle of the frame on its way. The bar tip's tangent points +x, which lets the whole descent stay on the right by construction.
export const createGPoints = () => gPoints.points.map(([x, y], index) => new Vector3(x, y, depthAt(index, gPoints.points.length)));

// Centripetal parameterisation, the one variant that cannot cusp or self-intersect. The samples are evenly spaced so the uniform
// variant would also hold here, but the master spine reuses the same builder over points that are not.
export const createGCurve = () => new CatmullRomCurve3(createGPoints(), false, 'centripetal');

// Spacing between consecutive baked samples. The master spine resamples the journey to match it — see masterSpine.js.
export const gSpacing = gPoints.arcLength / (gPoints.points.length - 1);

export const gArcLength = gPoints.arcLength;
export const gBounds = gPoints.bounds;
