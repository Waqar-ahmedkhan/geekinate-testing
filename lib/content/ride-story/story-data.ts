import { chapters } from './chapters';
import { milestones } from './milestones';
import { people } from './people';
import { assets } from './assets';
import { validateStory } from './CONTENT_SCHEMA';
validateStory(milestones, chapters, people, assets);
export { chapters, milestones, people, assets };
export { sceneMotion } from './scene-motion';
export { copy } from './story-copy';
