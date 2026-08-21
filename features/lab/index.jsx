'use client';

import { useEffect, useRef, useState } from 'react';
import { createLife } from '@/lib/ui/reusable_components/cosmos/automata';
import { LAB_PRESETS } from '@/constants';

const STAMP = 3.2;

const paint = (context, life, preset, size, drift) => {
  const { cols, rows, pixels } = life;
  const cell = size.width / cols;
  context.clearRect(0, 0, size.width, size.height);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const glow = pixels[(row * cols + col) * 4 + 1] / 255;
      if (glow < 0.02) continue;
      const y = (((row - drift) % rows) + rows) % rows;
      const radius = cell * preset.dot * (0.45 + glow * 0.55);
      context.globalAlpha = glow * preset.opacity;
      context.fillStyle = glow > 0.99 ? '#fdfdfb' : '#b8e01b';
      context.beginPath();
      context.arc((col + 0.5) * cell, (y + 0.5) * cell, radius, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;
};

export default function BackgroundLab() {
  const canvas = useRef(null);
  const pointer = useRef({ x: 0.68, y: 0.5 });
  const [index, setIndex] = useState(0);
  const preset = LAB_PRESETS[index];

  useEffect(() => {
    const element = canvas.current;
    const context = element.getContext('2d');
    const life = createLife();
    const size = { width: 0, height: 0 };
    let frame = 0,
      last = 0,
      clock = 0,
      drift = 0;
    const measure = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      if (width === size.width && height === size.height) return;
      size.width = width;
      size.height = height;
      element.width = width;
      element.height = height;
      life.resize(Math.max(8, Math.round(width / preset.cell)), Math.max(8, Math.round(height / preset.cell)));
    };
    const tick = (now) => {
      measure();
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      clock += delta;
      drift += delta * preset.drift;
      const interval = 1 / preset.rate;
      if (clock >= interval) {
        clock %= interval;
        const col = pointer.current.x * life.cols,
          row = pointer.current.y * life.rows + drift;
        const spread = STAMP;
        for (let dy = -spread; dy <= spread; dy += 1) {
          for (let dx = -spread; dx <= spread; dx += 1) {
            if (dx * dx + dy * dy > spread * spread) continue;
            life.seed(Math.round(col + dx), Math.round(row + dy));
          }
        }
        life.step(preset.decay, preset.spawn);
      }
      paint(context, life, preset, size, drift);
      frame = requestAnimationFrame(tick);
    };
    const track = (event) => {
      pointer.current = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight };
    };
    window.addEventListener('pointermove', track, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      window.removeEventListener('pointermove', track);
    };
  }, [preset]);

  return (
    <main className='relative z-20 min-h-svh overflow-hidden bg-void'>
      <canvas ref={canvas} className='absolute inset-0 size-full' />
      <div className='relative flex min-h-svh flex-col justify-between p-8 md:p-14'>
        <div className='flex flex-wrap gap-2'>
          {LAB_PRESETS.map((option, position) => (
            <button
              key={option.name}
              type='button'
              onClick={() => setIndex(position)}
              className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-200 ${
                position === index ? 'bg-volt text-ink' : 'border-brutal text-paper/70 hover:text-paper'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
        <div className='max-w-[36rem]'>
          <p className='font-mono text-xs uppercase tracking-[0.18em] text-mut'>Background prototype</p>
          <h1 className='mt-4 font-display text-[clamp(2.5rem,4.6vw,4.25rem)] italic leading-[1.04]'>
            We build AI, games, <span className='text-paper/40'>and the web around them.</span>
          </h1>
          <p className='mt-6 max-w-[46ch] text-sm leading-[1.7] text-mut'>{preset.note}</p>
        </div>
      </div>
    </main>
  );
}
