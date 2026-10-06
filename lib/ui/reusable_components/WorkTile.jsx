'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

const SPANS = {
  2: 'lg:col-span-2 aspect-square',
  3: 'lg:col-span-3 aspect-square lg:aspect-[3/2]',
  4: 'lg:col-span-4 aspect-square sm:aspect-[2/1]',
  6: 'lg:col-span-6 aspect-square sm:aspect-[2/1]',
};
const SIZES = {
  2: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  3: '(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw',
  4: '(min-width: 1024px) 67vw, (min-width: 640px) 50vw, 100vw',
  6: '100vw',
};
const TILE = 'group border-brutal relative block overflow-hidden rounded-lg bg-black shadow-brutal';
const POSTER = 'pointer-events-none object-cover transition-opacity duration-300';
const REVEAL = 'absolute inset-0 opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100';
const TITLE = 'text-lg font-medium text-paper drop-shadow-[0_1px_8px_rgba(16,22,19,0.55)] transition-[color,filter] duration-300';
const CHIP = 'rounded-[5px] bg-paper/25 px-[10px] py-[5px] text-xs text-paper backdrop-blur-[2px] transition-colors duration-300';
const ON_LIGHT = { title: 'group-hover:text-ink group-hover:drop-shadow-none', chip: 'group-hover:bg-ink/10 group-hover:text-ink' };

export default function WorkTile({ title, disciplines = [], span = 2, href, media, hoverMedia, className: tileClassName }) {
  const paired = Boolean(hoverMedia);
  const poster = media?.poster;
  const [playing, setPlaying] = useState(false);
  const { videoRef: baseRef, hoverHandlers: baseHandlers } = useHoverVideo();
  const { videoRef: revealRef, hoverHandlers: revealHandlers } = useHoverVideo({ hoverOnly: true });
  useEffect(() => {
    const video = baseRef.current;
    if (!poster || !video) return undefined;
    const markPlaying = () => setPlaying(true);
    const markPaused = () => setPlaying(false);
    video.addEventListener('playing', markPlaying);
    video.addEventListener('pause', markPaused);
    return () => {
      video.removeEventListener('playing', markPlaying);
      video.removeEventListener('pause', markPaused);
    };
  }, [poster, baseRef]);
  const hoverHandlers = paired ? revealHandlers : baseHandlers;
  const onLight = paired && hoverMedia.tone === 'light';
  const className = cn(TILE, SPANS[span] ?? SPANS[2], tileClassName);
  const titleClass = cn(TITLE, onLight && ON_LIGHT.title);
  const chipClass = cn(CHIP, onLight && ON_LIGHT.chip);
  const Tag = href ? Link : 'div';
  const linkProps = href ? { href } : {};
  const loop = media?.loop ?? true;
  const revealLoop = hoverMedia?.loop ?? true;
  const focusStyle = media?.focus ? { objectPosition: media.focus } : undefined;
  const posterClass = cn(POSTER, playing && 'opacity-0');
  const posterEl = poster ? (
    <Image src={poster} alt='' fill sizes={SIZES[span] ?? SIZES[2]} style={focusStyle} className={posterClass} />
  ) : null;
  const baseEl = paired ? null : <VideoSurface ref={baseRef} media={media} fit='cover' loop={loop} poster={false} />;
  const revealEl = paired ? <VideoSurface ref={revealRef} media={hoverMedia} fit='cover' loop={revealLoop} className={REVEAL} /> : null;
  return (
    <Tag {...linkProps} {...hoverHandlers} className={className}>
      {baseEl}
      {posterEl}
      {revealEl}
      <div className='absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 md:p-6'>
        <h3 className={titleClass}>{title}</h3>
        <ul className='flex flex-wrap gap-2'>
          {disciplines.map((discipline) => (
            <li key={discipline} className={chipClass}>
              {discipline}
            </li>
          ))}
        </ul>
      </div>
    </Tag>
  );
}
