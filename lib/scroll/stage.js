// Where the page tells the particle scene where it is. Two ScrollTriggers write the first pair, the scene damps toward them inside
// its own frame loop and reads nothing else.
//
// Module singletons mutated in place for the same reason as scrollProgress beside them: these change on every scroll frame, and a
// React re-render per frame would cost more than the scene being driven.
//
// `heroOut` and `footerIn` are deliberately independent rather than combined into one progress. One cloud wears three shapes down
// this page — the globe in the hero, a scattered field through the body, the letterform at the footer — and the two ends have
// nothing to say to each other: `heroOut` closes the globe, `footerIn` opens the mark, and the scatter is what is left when neither
// is claimed. They were multiplied together once, into a single form curve that assembled the letterform at both ends of the page;
// with the globe holding the hero that made the mark resolve underneath exactly as the world came apart, and the globe morphed into
// a G in mid-air.
//
// `globe` and `form` are the damped values the scene actually renders, kept here so the shells and the land read the same numbers.
// `light` is whether the ground under the scene is white — the hero and the footer are both dark, so it is a constant 0 until some
// future section puts the mark over paper again.
export const stage = { heroOut: 0, footerIn: 0, form: 0, globe: 1, light: 0 };
