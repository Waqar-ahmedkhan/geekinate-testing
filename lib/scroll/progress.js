// The single source of animation time for the 3D mark. Scroll position is the only clock — there is no autoplay and no timeline
// running independently of it.
//
// Deliberately a module singleton mutated in place rather than React state or a store. Everything here changes every frame, and a
// re-render per scroll frame would cost more than the scene it drives. `SmoothScroll` writes `raw`; the scene damps toward
// `damped` inside its own useFrame and reads nothing else.
export const scrollProgress = { raw: 0, damped: 0, reduced: false };
