import { Color } from 'three';

const FALLBACK = { paper: '#fdfdfb', volt: '#b8e01b', ink: '#101613' };

export function readPalette() {
  const styles = typeof window === 'undefined' ? null : getComputedStyle(document.documentElement);
  const pick = (name, backup) => (styles ? styles.getPropertyValue(name).trim() : '') || backup;
  return {
    paper: new Color(pick('--white', FALLBACK.paper)),
    volt: new Color(pick('--volt', FALLBACK.volt)),
    ink: new Color(pick('--ink', FALLBACK.ink)),
  };
}
