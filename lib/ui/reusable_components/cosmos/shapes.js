import { computeGlobe } from '@/lib/globe/pose';
import { seeded } from '@/lib/globe/sphere';
import { sampleCloud } from '@/lib/shape/cloud';
import { COSMOS } from '@/constants';

export const computeCloud = () =>
  sampleCloud(COSMOS.count, { radius: COSMOS.cloudRadius, flatten: COSMOS.cloudFlatten, random: seeded(COSMOS.seed) });
export const computeShapes = () => ({ globe: computeGlobe(), cloud: computeCloud() });
