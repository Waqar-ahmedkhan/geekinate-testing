'use client';

import Image from 'next/image';
import useSettled from './useSettled';
import { TOUCH_SCREEN } from '@/constants';

const SOURCE_HEIGHT = 160;
const WIDEST_SCALE = 1.15;
const SIZING = 'h-[var(--logo-h)] w-auto md:h-[calc(var(--logo-h)*1.15)]';
const INK_LAYER = `${SIZING} transition-opacity duration-300 group-hover:opacity-0`;
const COLOR_LAYER = `${SIZING} absolute left-0 top-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100`;
const HOLDER = `${SIZING} block`;

export default function ClientLogo({ name, src, width, size }) {
  const settled = useSettled();
  const touch = settled && window.matchMedia(TOUCH_SCREEN).matches;
  const hovers = settled && !touch;
  const scale = { '--logo-h': `${size}px` };
  const colorSrc = src.replace('.webp', '-color.webp');
  const restSrc = touch ? colorSrc : src;
  const height = Math.round(size * WIDEST_SCALE);
  const shown = { width: Math.round((width * height) / SOURCE_HEIGHT), height };
  const holderStyle = { aspectRatio: `${width} / ${SOURCE_HEIGHT}` };
  const colorEl = hovers ? <Image src={colorSrc} alt='' aria-hidden='true' {...shown} className={COLOR_LAYER} /> : null;
  const layerEls = settled ? (
    <>
      <Image src={restSrc} alt={name} {...shown} className={INK_LAYER} />
      {colorEl}
    </>
  ) : (
    <span role='img' aria-label={name} className={HOLDER} style={holderStyle} />
  );
  return (
    <span style={scale} className='group relative shrink-0'>
      {layerEls}
    </span>
  );
}
