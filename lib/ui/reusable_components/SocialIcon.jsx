// The three brand glyphs, inlined for the same reason BrandMark is: no request, and they sit inside a text run.
//
// **Not from lucide.** The set dropped its brand icons at v1.0 and the package here is 1.28, so `Github` and `Linkedin` no longer
// exist — and the `X` it still exports is the close cross, which would put a dismiss control where a link to X is meant to be. These
// are the marks' own paths on their own 24 grid.
//
// `currentColor` throughout, so the icon inherits the link's colour and its hover with it rather than carrying a second copy of the
// footer's palette that would have to be kept in step.
const GLYPHS = {
  LinkedIn:
    'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85' +
    'c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z' +
    'M22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z',
  GitHub:
    'M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61' +
    '-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6' +
    '-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0' +
    'c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22' +
    '0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z',
  X: 'M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.6l5.24 6.93ZM17.6 20.64h2.04L6.49 3.24H4.3Z',
};

export default function SocialIcon({ name, className }) {
  const path = GLYPHS[name];
  if (!path) return null;
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true' focusable='false' className={className}>
      <path d={path} />
    </svg>
  );
}
