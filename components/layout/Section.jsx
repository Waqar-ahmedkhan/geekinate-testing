import { cn } from '@/lib/utils';

// Dark surfaces are pure black, not --ink. The logo file uses --gk-ink for its dark blocks, but #101613 carries a green cast that
// reads as a colour wash over a full-bleed section — rejected on sight. --ink stays the type, border and shadow token.
const variants = {
  default: 'bg-background text-foreground',
  wash: 'bg-wash text-ink',
  ink: 'bg-black text-paper',
};

export default function Section({ id, variant = 'default', className, children }) {
  return (
    <section id={id} className={cn('px-6 py-20 md:px-10 md:py-28', variants[variant], className)}>
      {children}
    </section>
  );
}
