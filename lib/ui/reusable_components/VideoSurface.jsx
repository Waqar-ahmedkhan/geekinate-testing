import { cn } from '@/lib/utils';

const LAYER = '[backface-visibility:hidden] [transform:translateZ(0)]';

export default function VideoSurface({ ref, media, fit = 'contain', loop = true, className }) {
  const sources = media?.sources ?? [];
  if (!sources.length) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-black', className)}>
        <span className='font-mono text-xs uppercase tracking-[0.18em] text-paper/25'>Media pending</span>
      </div>
    );
  }
  return (
    <video
      ref={ref}
      poster={media.poster || undefined}
      loop={loop}
      muted
      playsInline
      preload='metadata'
      className={cn('h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain', LAYER, className)}
    >
      {sources.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>
  );
}
