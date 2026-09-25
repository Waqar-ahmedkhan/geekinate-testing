import { computeGlobe } from '@/lib/globe/pose';
import { sampleCloud } from '@/lib/shape/cloud';
import { COSMOS } from '@/constants';

export const computeCloud = () => sampleCloud(COSMOS.count, { radius: COSMOS.cloudRadius, flatten: COSMOS.cloudFlatten });
export const computeShapes = () => ({ globe: computeGlobe(), cloud: computeCloud() });
