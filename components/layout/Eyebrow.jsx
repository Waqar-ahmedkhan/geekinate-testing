import { cn } from '@/lib/utils';

export default function Eyebrow({ className, children }) {
  // text-mut, not a literal: the page alternates between the dark ground and paper sections, and this resolves to paper at low alpha
  // on one and to --grey on the other. `.on-paper` in globals.css is what does the swapping.
  return <span className={cn('font-mono text-xs uppercase tracking-[0.18em] text-mut', className)}>{children}</span>;
}
