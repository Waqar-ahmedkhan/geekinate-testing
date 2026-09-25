const AHEAD = '25% 0px';

let observer = null;

const warm = (video) => {
  video.preload = 'metadata';
};

const warmSeen = (entries) =>
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    observer.unobserve(target);
    warm(target);
  });

export function preloadWhenNear(video) {
  observer = observer || new IntersectionObserver(warmSeen, { rootMargin: AHEAD });
  observer.observe(video);
  return () => observer.unobserve(video);
}

export function preloadAfterLoad(video) {
  if (document.readyState === 'complete') {
    warm(video);
    return () => {};
  }
  const start = () => warm(video);
  window.addEventListener('load', start, { once: true });
  return () => window.removeEventListener('load', start);
}
