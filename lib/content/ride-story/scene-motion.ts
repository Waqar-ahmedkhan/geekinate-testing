export const sceneMotion = {
  intro: { scale: 1.01, x: 0, year: 0, arrival: 0, unfold: 0, caption: 0, sound: 0.1, transition: 'Open the map' },
  origin: { scale: 1.04, x: 0, year: 0, arrival: 1.25, unfold: 0.65, caption: 1.0, sound: 0.3, transition: 'Slide in from left' },
  engineering: {
    scale: 1.06,
    x: -16,
    year: 0.25,
    arrival: 1.25,
    unfold: 1.05,
    caption: 1.4,
    sound: 0.35,
    transition: 'Drop in from top',
  },
  growth: { scale: 1.05, x: 12, year: 0.2, arrival: 1.25, unfold: 1.0, caption: 1.3, sound: 0.35, transition: 'Glide in from right' },
  interactive: { scale: 1.06, x: -10, year: 0.2, arrival: 1.25, unfold: 0.95, caption: 1.3, sound: 0.35, transition: 'Rise from bottom' },
  studio: { scale: 1.0, x: 0, year: 0, arrival: 0, unfold: 0.35, caption: 1.0, sound: 0.1, transition: 'Camera flash finale' },
};
