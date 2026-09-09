import gsap from 'gsap';
import { BLUEPRINT_REVEAL } from '@/constants';

const from = { opacity: 0, y: BLUEPRINT_REVEAL.rise };
const to = { opacity: 1, y: 0 };

export const revealResult = (root) => {
  if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  return gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: BLUEPRINT_REVEAL.ease } });
    timeline.fromTo('[data-reveal="head"]', from, { ...to, duration: BLUEPRINT_REVEAL.head }, 0);
    timeline.fromTo('[data-reveal="column"]', from, { ...to, duration: BLUEPRINT_REVEAL.columns }, BLUEPRINT_REVEAL.columnsAt);
    timeline.fromTo(
      '[data-reveal="build"]',
      from,
      { ...to, duration: BLUEPRINT_REVEAL.builds, stagger: BLUEPRINT_REVEAL.stagger },
      BLUEPRINT_REVEAL.buildsAt
    );
    timeline.fromTo('[data-reveal="capture"]', from, { ...to, duration: BLUEPRINT_REVEAL.capture }, BLUEPRINT_REVEAL.captureAt);
  }, root);
};
