import { cn } from '@/lib/utils';

// Inverted for the dark ground on 2026-08-11. Same glass, read the other way round: the inset highlight is light instead of dark,
// and brightness comes down rather than up — a pill that brightens what is behind it turns the starfield into a smear.
const surface =
  'relative flex items-center rounded-full border border-line bg-glass shadow-[inset_0_1px_0_rgba(253,253,251,0.09)] ' +
  'backdrop-blur-[10px] backdrop-saturate-[1.4]';

export default function GlassPill({ ref, className, style, children }) {
  return (
    <div ref={ref} className={cn(surface, className)} style={style}>
      {children}
    </div>
  );
}
