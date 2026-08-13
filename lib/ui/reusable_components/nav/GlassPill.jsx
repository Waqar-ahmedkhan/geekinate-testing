import { cn } from '@/lib/utils';

// Inverted for the dark ground on 2026-08-11. Same glass, read the other way round: the inset highlight is light instead of dark,
// and brightness comes down rather than up — a pill that brightens what is behind it turns the starfield into a smear.
//
// One surface, on every ground. A paper variant was tried for the white hero on 2026-08-12 and rejected on sight: the pill is the
// same object all the way down the page, and swapping it to an ink-on-paper treatment for one section reads as two different
// navbars rather than as one adapting. The grey it composites to over white is the intended look, not a defect to correct.
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
