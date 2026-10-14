const locked = new Set();

let restricted = false,
  armed = false;

export const SHARE_STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
export const shownShare = (entry) =>
  entry.intersectionRect.height / Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? window.innerHeight);

const granted = (event) => navigator.userActivation?.isActive ?? event.type === 'click';
const lineMargin = (line) => `0px 0px ${Math.round((line - 1) * 100)}% 0px`;

const release = (event) => {
  if (!restricted || !granted(event)) return;
  const unlocks = [...locked];
  locked.clear();
  unlocks.forEach((unlock) => unlock());
};

const unlockOnGesture = (unlock) => {
  if (!armed) {
    armed = true;
    window.addEventListener('touchend', release, { capture: true, passive: true });
    window.addEventListener('click', release, { capture: true });
  }
  locked.add(unlock);
  return () => locked.delete(unlock);
};

export function playWhileShown(video, { share, line = 1 }) {
  let shown = false;
  const refuse = ({ name }) => {
    if (name !== 'NotAllowedError') return;
    restricted = true;
    unlockOnGesture(unlock);
  };
  const start = () => video.play().catch(refuse);
  const unlock = () => (shown ? start() : video.load());
  const forget = unlockOnGesture(unlock);
  const arrival = new IntersectionObserver(
    ([entry]) => {
      if (shown || !entry.isIntersecting || shownShare(entry) < share) return;
      shown = true;
      start();
    },
    { threshold: SHARE_STEPS, rootMargin: lineMargin(line) }
  );
  const departure = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) return;
    shown = false;
    video.pause();
    video.currentTime = 0;
  });
  video.addEventListener('playing', forget);
  arrival.observe(video);
  departure.observe(video);
  return () => {
    forget();
    video.removeEventListener('playing', forget);
    arrival.disconnect();
    departure.disconnect();
  };
}
