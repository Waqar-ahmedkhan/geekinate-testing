const locked = new Set();

let restricted = false,
  armed = false;

const granted = (event) => navigator.userActivation?.isActive ?? event.type === 'click';

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

export function playWhileShown(video, threshold) {
  let shown = false;
  const refuse = ({ name }) => {
    if (name !== 'NotAllowedError') return;
    restricted = true;
    unlockOnGesture(unlock);
  };
  const start = () => video.play().catch(refuse);
  const unlock = () => (shown ? start() : video.load());
  const forget = unlockOnGesture(unlock);
  const observer = new IntersectionObserver(
    ([entry]) => {
      shown = entry.isIntersecting;
      if (shown) {
        start();
        return;
      }
      video.pause();
      video.currentTime = 0;
    },
    { threshold }
  );
  video.addEventListener('playing', forget);
  observer.observe(video);
  return () => {
    forget();
    video.removeEventListener('playing', forget);
    observer.disconnect();
  };
}
