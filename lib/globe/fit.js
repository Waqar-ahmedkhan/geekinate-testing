import { GLOBE } from '@/constants';

export const fitGlobe = (aspect, apex = GLOBE.apex) => {
  const [low, high] = GLOBE.aspectRange;
  const framed = Math.min(high, Math.max(low, aspect));
  const drop = GLOBE.drop;
  const radius = (framed * framed + drop * drop) / (2 * drop);
  return { radius, centreY: apex - radius };
};

export const globeApex = (floor, height) => (floor ? 1 - (2 * (floor + GLOBE.floorGap)) / height : GLOBE.apex);
