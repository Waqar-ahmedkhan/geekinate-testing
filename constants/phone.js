export const PHONE = {
  query: '(width < 48rem)',
  still: { href: '/media/hero/globe-phone.avif', type: 'image/avif' },
  clip: { src: '/media/hero/globe-phone.mp4', wakeLead: 2.5, handoffAtTop: 0.02 },
  frame: { width: 1.6, height: 1.65, rim: 0.15 },
  floorGuess: 313,
  wake: ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'],
};
