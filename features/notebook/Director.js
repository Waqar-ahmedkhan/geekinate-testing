'use client';

import { useEffect, useRef, useState } from 'react';
import { chapters } from '@/lib/content/notebook';

export function useDirector(stage) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const audio = useRef(null);
  const position = useRef(0);
  const index = chapters.findLastIndex(([start]) => time >= start);

  function seek(value) {
    position.current = value;
    setTime(value);
  }

  function toggleSound() {
    if (!sound) {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    }
    setSound(!sound);
  }

  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - position.current * 1000;
    let frame;
    function tick(now) {
      const value = Math.min(60, (now - start) / 1000);
      seek(value);
      if (value < 60) frame = requestAnimationFrame(tick);
      else setPlaying(false);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false);
    });
    observer.observe(stage.current);
    const onVisibility = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [stage]);

  useEffect(() => {
    const context = audio.current;
    if (!sound || !playing || !context) return;
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.frequency.value = 220 + index * 22;
    gain.gain.setValueAtTime(0.018, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.24);
    tone.connect(gain).connect(context.destination);
    tone.start();
    tone.stop(context.currentTime + 0.25);
    return () => {
      tone.disconnect();
      gain.disconnect();
    };
  }, [index, playing, sound]);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    []
  );

  return {
    time,
    index,
    playing,
    sound,
    toggleSound,
    pause: () => setPlaying(false),
    jump(value) {
      setPlaying(false);
      seek(value);
    },
    toggle() {
      if (time >= 60) seek(0);
      setPlaying(!playing);
    },
  };
}
