'use client';

import { useEffect, useRef } from 'react';
import VideoSurface from './VideoSurface';
import { playWhileShown } from '@/lib/media/autoplay';

export default function InViewVideo({ media, fit = 'cover', loop = false, eager = false, threshold = 0.2, className }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    return playWhileShown(video, { share: threshold });
  }, [threshold]);
  return <VideoSurface ref={videoRef} media={media} fit={fit} loop={loop} eager={eager} className={className} />;
}
