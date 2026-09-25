import Image from 'next/image';

const SOURCE_HEIGHT = 160;
const WIDEST_SCALE = 1.15;
const SIZING = 'h-[var(--logo-h)] w-auto md:h-[calc(var(--logo-h)*1.15)]';
const INK_LAYER = `${SIZING} transition-opacity duration-300 group-hover:opacity-0`;
const COLOR_LAYER = `${SIZING} absolute left-0 top-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100`;

export default function ClientLogo({ name, src, width, size }) {
  const scale = { '--logo-h': `${size}px` };
  const colorSrc = src.replace('.webp', '-color.webp');
  const height = Math.round(size * WIDEST_SCALE);
  const shown = { width: Math.round((width * height) / SOURCE_HEIGHT), height };
  return (
    <span style={scale} className='group relative shrink-0'>
      <Image src={src} alt={name} {...shown} className={INK_LAYER} />
      <Image src={colorSrc} alt='' aria-hidden='true' {...shown} className={COLOR_LAYER} />
    </span>
  );
}
