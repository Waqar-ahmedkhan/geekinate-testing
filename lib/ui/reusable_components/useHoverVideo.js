'use client';

import { useRef } from 'react';

// Shared by every hover-to-play surface. Stokt pauses in place on leave, which reads as a stall on re-hover; rewinding means each
// hover starts the motion from the top.
export default function useHoverVideo() {
  const videoRef = useRef(null);
  const play = () => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.play().catch(() => {});
  };
  const rewind = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };
  return { videoRef, hoverHandlers: { onMouseEnter: play, onMouseLeave: rewind } };
}
