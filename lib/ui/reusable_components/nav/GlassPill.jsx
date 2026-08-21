import { cn } from '@/lib/utils';

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
