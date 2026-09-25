'use client';

import { useEffect, useRef } from 'react';
import { preloadAfterLoad, preloadWhenNear } from '@/lib/media/preload';
import { cn } from '@/lib/utils';

const LAYER = '[backface-visibility:hidden] [transform:translateZ(0)]';

export default function VideoSurface({ ref, media, fit = 'contain', loop = true, eager = false, poster = true, className }) {
  const ownRef = useRef(null);
  const videoRef = ref ?? ownRef;
  const sources = media?.sources ?? [];
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    return eager ? preloadAfterLoad(video) : preloadWhenNear(video);
  }, [eager, videoRef]);
  if (!sources.length) {
    return (
      <div className={cn('flex h-full w-full items-center justify-center bg-black', className)}>
        <span className='font-mono text-xs uppercase tracking-[0.18em] text-paper/25'>Media pending</span>
      </div>
    );
  }
  const focusStyle = media.focus ? { objectPosition: media.focus } : undefined;
  const posterSrc = poster ? media.poster : undefined;
  return (
    <video
      ref={videoRef}
      poster={posterSrc || undefined}
      loop={loop}
      muted
      playsInline
      preload='none'
      style={focusStyle}
      className={cn('h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain', LAYER, className)}
    >
      {sources.map(({ src, type }) => (
        <source key={src} src={src} type={type} />
      ))}
    </video>
  );
}
