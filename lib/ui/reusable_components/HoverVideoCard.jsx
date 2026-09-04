'use client';

import Link from 'next/link';
import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

const RING = 'ring-edge rounded-lg p-px shadow-brutal';
const SURFACE =
  'glass group flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)-1px)] p-5 outline-none focus-visible:ring-2 focus-visible:ring-volt';

export default function HoverVideoCard({ title, summary, href, media, className }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  const Tag = href ? Link : 'div';
  const linkProps = href ? { href } : {};
  const clipEl = media?.sources?.length ? (
    <div className='-mx-5 aspect-square overflow-hidden'>
      <VideoSurface ref={videoRef} media={media} fit='contain' loop={media.loop ?? true} className='mix-blend-screen' />
    </div>
  ) : null;
  return (
    <div className={cn(RING, className)}>
      <Tag {...linkProps} {...hoverHandlers} className={SURFACE}>
        {clipEl}
        <div className='mt-auto flex flex-col gap-2 pt-5'>
          <h3 className='text-2xl leading-none tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-volt'>
            {title}
          </h3>
          <p className='max-w-[46ch] text-sm leading-[1.6] text-mut'>{summary}</p>
        </div>
      </Tag>
    </div>
  );
}
