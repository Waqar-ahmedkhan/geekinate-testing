'use client';

import { useEffect, useRef } from 'react';
import VideoSurface from './VideoSurface';

// Scroll-into-view playback, measured off wearestokt.com's footer: the render is a one-shot that starts as the panel arrives, not a
// background loop. IntersectionObserver rather than the autoplay attribute — an autoplaying video at the bottom of the page spends
// bandwidth and decode budget before anyone has scrolled to it.
//
// Leaving rewinds to frame 0 for the same reason useHoverVideo does: resuming a one-shot mid-motion reads as a stall.
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
