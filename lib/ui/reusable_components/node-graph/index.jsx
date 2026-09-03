'use client';

import { useEffect, useRef } from 'react';
import { buildBoard, primeBoard, stepBoard, wakeBoard } from './board';
import { paintBoard } from './paint';
import { cn } from '@/lib/utils';
import { NODE_GRAPH } from '@/constants';

const MAX_DELTA = 0.05;
const ON_SCREEN = 0.01;
const EDGE_FADE = `linear-gradient(to bottom, transparent 0%, #000 ${NODE_GRAPH.fadeTop}%, #000 ${NODE_GRAPH.fadeFoot}%, transparent 100%)`;
const FRAME_STYLE = { maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE };

export default function NodeGraphBoard({ className }) {
  const frameRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!frame || !canvas || !svg) return undefined;
    const ctx = canvas.getContext('2d');
    const board = buildBoard(svg);
    const view = { width: 0, height: 0, dpr: 1 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(hover: none)').matches;
    let running = false,
      onScreen = false,
      raf = 0,
      last = 0;
    const resize = () => {
      const box = frame.getBoundingClientRect();
      view.dpr = Math.min(Math.ceil(Math.max(window.devicePixelRatio || 1, NODE_GRAPH.minSample)), NODE_GRAPH.maxDpr);
      view.width = Math.max(1, Math.round(box.width));
      view.height = Math.max(1, Math.round(box.height));
      canvas.width = view.width * view.dpr;
      canvas.height = view.height * view.dpr;
      canvas.style.width = `${view.width}px`;
      canvas.style.height = `${view.height}px`;
    };
    const rest = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const loop = (now) => {
      if (!running) return;
      const delta = last ? Math.min((now - last) / 1000, MAX_DELTA) : 1 / 60;
      last = now;
      const busy = stepBoard(board, delta);
      paintBoard(ctx, board, view);
      if (busy) raf = requestAnimationFrame(loop);
      else rest();
    };
    const wake = () => {
      if (running || reduced || !onScreen || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const sync = () => (onScreen && !document.hidden ? wake() : rest());
    const enter = () => {
      wakeBoard(board);
      wake();
    };
    const leave = () => {
      board.live = false;
    };
    resize();
    if (reduced) {
      primeBoard(board);
      paintBoard(ctx, board, view);
    }
    const sizer = new ResizeObserver(() => {
      resize();
      if (!running) paintBoard(ctx, board, view);
    });
    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (touch && onScreen) wakeBoard(board);
        if (touch && !onScreen) board.live = false;
        sync();
      },
      { threshold: ON_SCREEN }
    );
    const host = frame.closest('[data-hover]') ?? frame;
    sizer.observe(frame);
    watcher.observe(frame);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', sync);
    return () => {
      rest();
      sizer.disconnect();
      watcher.disconnect();
      host.removeEventListener('pointerenter', enter);
      host.removeEventListener('pointerleave', leave);
      document.removeEventListener('visibilitychange', sync);
      svg.replaceChildren();
    };
  }, []);

  return (
    <div ref={frameRef} style={FRAME_STYLE} className={cn('relative h-full w-full overflow-hidden', className)}>
      <canvas ref={canvasRef} className='block h-full w-full' />
      <svg ref={svgRef} width='0' height='0' aria-hidden='true' className='absolute' />
    </div>
  );
}
