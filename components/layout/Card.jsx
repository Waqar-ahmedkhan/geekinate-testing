import { cn } from '@/lib/utils';

const SHELL = 'ring-edge h-full rounded-lg p-px shadow-brutal';
const BODY = 'glass flex h-full flex-col gap-3 rounded-[calc(var(--radius)-1px)] p-6 md:p-8';

export default function Card({ onPaper, className, shellClassName, children }) {
  return (
    <div className={cn(SHELL, onPaper && 'on-ink', shellClassName)}>
      <div className={cn(BODY, className)}>{children}</div>
    </div>
  );
}
