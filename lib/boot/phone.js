import { PHONE } from '@/constants';

export const isPhone = () => window.matchMedia(PHONE.query).matches;

export function onFirstInput(listener) {
  const release = () => PHONE.wake.forEach((type) => window.removeEventListener(type, fire));
  const fire = () => {
    release();
    listener();
  };
  PHONE.wake.forEach((type) => window.addEventListener(type, fire, { passive: true }));
  return release;
}
