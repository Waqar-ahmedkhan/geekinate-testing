import { buildNetwork } from './arcs';
import { buildGlobePose } from './dots';
import { seeded } from './sphere';
import { COSMOS, GLOBE } from '@/constants';

export function computeGlobe() {
  const random = seeded(GLOBE.seed);
  const pose = buildGlobePose(COSMOS.count, random, GLOBE.jitter);
  return { pose, network: buildNetwork(pose, COSMOS.count, random) };
}
