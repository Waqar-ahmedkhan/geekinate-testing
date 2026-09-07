import { cn } from '@/lib/utils';

const badge =
  'flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink bg-volt font-mono text-xs text-ink shadow-[2px_2px_0_var(--ink)]';

export default function StepIndex({ value, className }) {
  return (
    <span aria-hidden='true' className={cn(badge, className)}>
      {String(value).padStart(2, '0')}
    </span>
  );
}
