'use client';

import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

const RING = 'ring-edge rounded-lg p-px shadow-brutal';

export default function HoverVideoCard({ title, summary, media, visual, className }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  const clip = media?.sources?.length ? (
    <VideoSurface ref={videoRef} media={media} fit='contain' loop={media?.loop ?? true} className='mix-blend-screen' />
  ) : null;
  const surface = visual ?? clip;
  const surfaceEl = surface ? <div className='-mx-5 aspect-square overflow-hidden'>{surface}</div> : null;
  return (
    <div className={cn(RING, className)}>
      <div
        {...hoverHandlers}
        data-hover=''
        className='glass group flex h-full flex-col overflow-hidden rounded-[calc(var(--radius)-1px)] p-5'
      >
        {surfaceEl}
        <div className='mt-auto flex flex-col gap-2 pt-5'>
          <h3 className='text-2xl leading-none tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-volt'>
            {title}
          </h3>
          <p className='max-w-[46ch] text-sm leading-[1.6] text-mut'>{summary}</p>
        </div>
      </div>
    </div>
  );
}
