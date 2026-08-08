import { cn } from '@/lib/utils';

const surface =
  'relative flex items-center rounded-full border border-ink/10 bg-wash/70 shadow-[inset_0_0_10px_rgba(16,22,19,0.08)] ' +
  'backdrop-blur-[2.6px] backdrop-saturate-[1.8] backdrop-brightness-[1.1]';

export default function GlassPill({ ref, className, style, children }) {
  return (
    <div ref={ref} className={cn(surface, className)} style={style}>
      {children}
    </div>
  );
}
