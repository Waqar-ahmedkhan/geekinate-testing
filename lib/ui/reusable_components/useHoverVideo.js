'use client';

import { useEffect, useRef } from 'react';

// Shared by every hover-to-play surface. Stokt pauses in place on leave, which reads as a stall on re-hover; rewinding means each
// hover starts the motion from the top.
//
// **A touch device never fires either handler, and every one of these surfaces is a video with no poster.** That left the entire
// Work grid and the Services cards as plain black rectangles on a phone — the media is the content in both sections, and none of it
// was reachable. So where the pointer cannot hover, the trigger becomes the scroll instead: the same play and rewind, driven by an
// IntersectionObserver rather than by the cursor.
//
// `(hover: none)` rather than a width breakpoint or a user-agent test. The question is not how wide the screen is, it is whether
// this input device can hover at all — a touchscreen laptop answers that correctly and a narrow desktop window does not.
const HALF_ON_SCREEN = 0.5;

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
  // Half the tile has to be on screen before it plays, which on a phone is close enough to one at a time that the page is not
  // decoding six clips at once — the reason these were never set to autoplay in the first place.
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
