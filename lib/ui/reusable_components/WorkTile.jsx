'use client';

import Link from 'next/link';
import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

// Written out in full rather than composed, so Tailwind can find the class names.
const SPANS = {
  1: 'lg:col-span-1 aspect-square',
  2: 'lg:col-span-2 aspect-square sm:aspect-[2/1]',
  3: 'lg:col-span-3 aspect-square sm:aspect-[16/9]',
};

export default function WorkTile({ title, disciplines = [], span = 1, href, media }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  // bg-black matters: the overlay is light text with no scrim, so a tile whose video has not painted yet — still loading, decode
  // failed, or no poster — would otherwise render that text onto the bare page background and vanish.
  const className = cn('group relative block overflow-hidden rounded-lg bg-black', SPANS[span] ?? SPANS[1]);
  // Placeholder entries have no case study to link to yet, and a dead link is worse than none.
  const Tag = href ? Link : 'div';
  const linkProps = href ? { href } : {};
  return (
    <Tag {...linkProps} {...hoverHandlers} className={className}>
      <VideoSurface ref={videoRef} media={media} fit='cover' />
      <div className='absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 md:p-6'>
        <h3 className='text-lg font-medium text-paper drop-shadow-[0_1px_8px_rgba(16,22,19,0.55)]'>{title}</h3>
        <ul className='flex flex-wrap gap-2'>
          {disciplines.map((discipline) => (
            <li key={discipline} className='rounded-[5px] bg-paper/25 px-[10px] py-[5px] text-xs text-paper backdrop-blur-[2px]'>
              {discipline}
            </li>
          ))}
        </ul>
      </div>
    </Tag>
  );
}
