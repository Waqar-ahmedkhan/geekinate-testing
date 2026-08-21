import { CatmullRomCurve3, Vector3 } from 'three';
import gPoints from './g-points.json';
import { SNAKE } from '@/constants';

const depthAt = (index, count) => Math.sin((index / (count - 1)) * Math.PI * 2 * SNAKE.waveCycles) * SNAKE.waveDepth;

export const createGPoints = () => gPoints.points.map(([x, y], index) => new Vector3(x, y, depthAt(index, gPoints.points.length)));

export const createGCurve = () => new CatmullRomCurve3(createGPoints(), false, 'centripetal');

export const gSpacing = gPoints.arcLength / (gPoints.points.length - 1);

export const gArcLength = gPoints.arcLength;
export const gBounds = gPoints.bounds;
