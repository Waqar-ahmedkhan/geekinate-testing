// Where the page tells the particle scene where it is. Two ScrollTriggers write these, the scene damps toward them inside its own
// frame loop and reads nothing else.
//
// They are kept as the two raw progresses rather than one combined number because they overlap in principle and are measured against
// different elements: `heroOut` runs 0 to 1 across the hero scrolling away, `footerIn` runs 0 to 1 across the footer arriving. The
// scene derives both how assembled the mark is and where it sits from the pair — see MorphCloud.
//
// Module singletons mutated in place for the same reason as scrollProgress beside them: these change on every scroll frame, and a
// React re-render per frame would cost more than the scene being driven.
export const stage = { heroOut: 0, footerIn: 0, form: 1, pose: 1, offset: 1 };
