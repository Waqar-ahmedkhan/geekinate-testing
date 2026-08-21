import { cn } from '@/lib/utils';

export default function Eyebrow({ className, children }) {
  return <span className={cn('font-mono text-xs uppercase tracking-[0.18em] text-mut', className)}>{children}</span>;
}
