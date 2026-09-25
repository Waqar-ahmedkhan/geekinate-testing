'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import useSettled from './useSettled';
import { cn } from '@/lib/utils';
import { WORK } from '@/constants';

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
const TILE = 'border-brutal relative block overflow-hidden rounded-lg bg-black shadow-brutal';
const POSTER = 'pointer-events-none object-cover transition-opacity duration-300';
const REVEAL = 'absolute inset-0 opacity-0 transition-opacity duration-300';
const LEGIBLE = 'text-shadow-[0_0_2px_rgb(0_0_0/0.9),0_1px_4px_rgb(0_0_0/0.7),0_2px_18px_rgb(0_0_0/0.6)]';
const TITLE = `text-lg font-medium text-paper ${LEGIBLE} transition-[color,text-shadow] duration-300`;
const CHIP =
  'rounded-[5px] bg-paper/25 px-[10px] py-[5px] text-xs text-paper text-shadow-[0_1px_2px_rgb(0_0_0/0.6)] backdrop-blur-[2px] transition-colors duration-300';
const ON_LIGHT = { title: 'text-ink text-shadow-none', chip: 'bg-ink/10 text-ink text-shadow-none' };

export default function WorkTile({ title, disciplines = [], span = 2, href, media, hoverMedia, className: tileClassName }) {
  const paired = Boolean(hoverMedia);
  const settled = useSettled();
  const poster = media?.poster;
  const [playing, setPlaying] = useState(false);
  const { videoRef: baseRef, hoverHandlers: baseHandlers } = useHoverVideo({ line: WORK.playLine });
  const { videoRef: revealRef, hoverHandlers: revealHandlers } = useHoverVideo({ hoverOnly: true, line: WORK.playLine });
  const watchedRef = paired ? revealRef : baseRef;
  useEffect(() => {
    const video = watchedRef.current;
    if (!video) return undefined;
    const markPlaying = () => setPlaying(true);
    const markPaused = () => setPlaying(false);
    video.addEventListener('playing', markPlaying);
    video.addEventListener('pause', markPaused);
    return () => {
      video.removeEventListener('playing', markPlaying);
      video.removeEventListener('pause', markPaused);
    };
  }, [watchedRef]);
  const hoverHandlers = paired ? revealHandlers : baseHandlers;
  const revealed = paired && playing;
  const onLight = revealed && hoverMedia.tone === 'light';
  const className = cn(TILE, SPANS[span] ?? SPANS[2], tileClassName);
  const titleClass = cn(TITLE, onLight && ON_LIGHT.title);
  const chipClass = cn(CHIP, onLight && ON_LIGHT.chip);
  const Tag = href ? Link : 'div';
  const linkProps = href ? { href } : {};
  const loop = media?.loop ?? true;
  const revealLoop = hoverMedia?.loop ?? true;
  const focusStyle = media?.focus ? { objectPosition: media.focus } : undefined;
  const posterClass = cn(POSTER, playing && !paired && 'opacity-0');
  const revealClass = cn(REVEAL, revealed && 'opacity-100');
  const posterEl =
    poster && settled ? (
      <Image src={poster} alt='' fill sizes={SIZES[span] ?? SIZES[2]} style={focusStyle} className={posterClass} />
    ) : null;
  const baseEl = paired ? null : <VideoSurface ref={baseRef} media={media} fit='cover' loop={loop} poster={false} />;
  const revealEl = paired ? (
    <VideoSurface ref={revealRef} media={hoverMedia} fit='cover' loop={revealLoop} className={revealClass} />
  ) : null;
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
