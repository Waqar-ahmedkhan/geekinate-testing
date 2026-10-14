'use client';

import { useEffect, useRef } from 'react';
import { playWhileShown } from '@/lib/media/autoplay';
import { INTRODUCE, TOUCH_SCREEN } from '@/constants';

const HALF_ON_SCREEN = 0.5;
const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
const REDUCED = '(prefers-reduced-motion: reduce)';
const reduced = () => window.matchMedia(REDUCED).matches;
const shownShare = (entry) =>
  entry.intersectionRect.height / Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? window.innerHeight);

export default function useHoverVideo({ introduce = false, hoverOnly = false } = {}) {
  const videoRef = useRef(null);
  const play = () => {
    const video = videoRef.current;
    if (!video || reduced() || !video.paused) return;
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => {});
  };
  const rewind = () => {
    const video = videoRef.current;
    if (!video || !video.loop) return;
    video.pause();
    video.currentTime = 0;
  };
  const restart = () => {
    const video = videoRef.current;
    if (!video || reduced()) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };
  const hold = () => videoRef.current?.pause();
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced()) return undefined;
    const touch = window.matchMedia(TOUCH_SCREEN);
    let stop = null;
    const follow = () => {
      stop?.();
      stop = touch.matches ? playWhileShown(video, HALF_ON_SCREEN) : null;
    };
    follow();
    touch.addEventListener('change', follow);
    return () => {
      touch.removeEventListener('change', follow);
      stop?.();
    };
  }, []);
  useEffect(() => {
    const video = videoRef.current;
    if (!introduce || !video || reduced()) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (shownShare(entry) < INTRODUCE.ratio) return;
        observer.disconnect();
        video.play().catch(() => {});
      },
      { threshold: STEPS }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [introduce]);
  const hoverHandlers = hoverOnly ? { onMouseEnter: restart, onMouseLeave: hold } : { onMouseEnter: play, onMouseLeave: rewind };
  return { videoRef, hoverHandlers };
}
