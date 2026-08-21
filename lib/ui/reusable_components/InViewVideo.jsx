'use client';

import { useEffect, useRef } from 'react';
import VideoSurface from './VideoSurface';

export default function InViewVideo({ media, fit = 'cover', loop = false, threshold = 0.2, className }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          return;
        }
        video.pause();
        video.currentTime = 0;
      },
      { threshold }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [threshold]);
  return <VideoSurface ref={videoRef} media={media} fit={fit} loop={loop} className={className} />;
}
