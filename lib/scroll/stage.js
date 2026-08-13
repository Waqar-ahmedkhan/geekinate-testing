// Where the page tells the particle scene where it is. Two ScrollTriggers write these, the scene damps toward them inside its own
// frame loop and reads nothing else.
//
// They are kept as the two raw progresses rather than one combined number because they overlap in principle and are measured against
// different elements: `heroOut` runs 0 to 1 across the hero scrolling away, `footerIn` runs 0 to 1 across the footer arriving. The
// scene derives both how assembled the mark is and where it sits from the pair — see MorphCloud.
//
// Module singletons mutated in place for the same reason as scrollProgress beside them: these change on every scroll frame, and a
// React re-render per frame would cost more than the scene being driven.
// `light` is whether the ground under the scene is the hero's paper wash rather than the void: 1 anywhere the hero is still on
// screen, 0 once it has gone. The substrate measures the hero's own box every frame and writes it here; the mark reads it to pick
// the colour of its own highlights, so the two can never disagree about which ground they are on.
//
// It was derived from `heroOut` first, fading out between 0.42 and 0.60 of that progress, and that was wrong for a reason worth
// keeping: `heroOut` runs over 1.7 screens while the hero is only one screen tall, so the wash was fading out while a strip of the
// hero was still at the top of the viewport — and that strip went black under the Work section's top edge.
export const stage = { heroOut: 0, footerIn: 0, form: 1, offset: 1, light: 1 };
