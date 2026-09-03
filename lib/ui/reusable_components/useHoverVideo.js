'use client';

import { useEffect, useRef } from 'react';

const HALF_ON_SCREEN = 0.5;

export default function useHoverVideo() {
  const videoRef = useRef(null);
  const play = () => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !video.paused) return;
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => {});
  };
  const rewind = () => {
    const video = videoRef.current;
    if (!video || !video.loop) return;
    video.pause();
    video.currentTime = 0;
  };
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !window.matchMedia('(hover: none)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          return;
        }
        video.pause();
        video.currentTime = 0;
      },
      { threshold: HALF_ON_SCREEN }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return { videoRef, hoverHandlers: { onMouseEnter: play, onMouseLeave: rewind } };
}
