import { Color } from 'three';

// The scene's two colours come out of the CSS custom properties rather than being retyped here. Brand values live in globals.css and
// nowhere else; a hex literal in a shader file is the kind of copy that drifts silently once someone retunes the token.
//
// The fallbacks exist only for the frame before styles resolve and for the server, and they are the same values.
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
