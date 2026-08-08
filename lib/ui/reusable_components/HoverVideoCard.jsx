'use client';

import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

// A 1px ring drawn as a gradient behind an inset fill, rather than a flat border — it catches light at the top-left and fades out,
// which is what stops a large dark card reading as a plain rectangle.
const RING = 'rounded-lg bg-[linear-gradient(126deg,rgba(253,253,251,0.18)_0%,rgba(253,253,251,0.04)_100%)] p-px';

export default function HoverVideoCard({ title, summary, media, className }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  return (
    <div className={cn(RING, className)}>
      <div {...hoverHandlers} className='group flex h-full flex-col rounded-[calc(var(--radius)-1px)] bg-black p-5'>
        <div className='aspect-[9/10] w-full overflow-hidden'>
          <VideoSurface ref={videoRef} media={media} fit='contain' />
        </div>
        <div className='mt-auto flex flex-col gap-2 pt-5'>
          <h3 className='text-2xl leading-none tracking-[-0.01em] text-paper transition-colors duration-300 group-hover:text-volt'>
            {title}
          </h3>
          <p className='max-w-[46ch] text-sm leading-[1.6] text-paper/60'>{summary}</p>
        </div>
      </div>
    </div>
  );
}
