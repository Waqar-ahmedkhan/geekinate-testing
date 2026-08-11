import { cn } from '@/lib/utils';

// `relative z-10` is what lifts every section over the fixed particle canvas at z-0, so a section's fill is also its decision about
// whether the scene shows through it. The page alternates deliberately: the dark sections let the starfield and the mark read behind
// them, and the paper sections hide the scene completely, which is what stops fifteen thousand viewport-pixels of drifting particles
// from sitting under every paragraph on the site.
//
// `paper` carries `on-paper`, which flips the border, shadow, muted-type and glass tokens back to the ink-on-white originals for its
// whole subtree — see globals.css. Cards inside it need no variant of their own.
//
// Dark surfaces are pure black rather than --ink: #101613 carries a green cast that reads as a colour wash at section scale. --ink
// stays the type, border and shadow token, where the difference from black is imperceptible.
const variants = {
  clear: 'text-foreground',
  paper: 'on-paper bg-paper text-ink',
  wash: 'bg-lift text-foreground',
  ink: 'bg-void/70 text-paper',
};

export default function Section({ id, variant = 'clear', className, children }) {
  return (
    <section id={id} className={cn('relative z-10 px-6 py-20 md:px-10 md:py-28', variants[variant], className)}>
      {children}
    </section>
  );
}
