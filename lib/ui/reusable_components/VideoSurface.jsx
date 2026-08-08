import { cn } from '@/lib/utils';

// Promoting the video to its own compositor layer makes Chrome resample once on the GPU rather than rescaling on every paint, which
// softens the stair-stepping on downscaled footage. It is a mitigation, not a fix: encoded video carries whatever anti-aliasing it
// was rendered with and CSS cannot add more. Encode clips near their rendered size — roughly 2× the box they sit in.
const LAYER = '[backface-visibility:hidden] [transform:translateZ(0)]';

// The pending panel is deliberately ink even on light sections: tiles overlay light text on their media, and a pale placeholder
// would make that text unreadable.
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
