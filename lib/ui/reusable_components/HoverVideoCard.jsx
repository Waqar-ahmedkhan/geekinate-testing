'use client';

import VideoSurface from './VideoSurface';
import useHoverVideo from './useHoverVideo';
import { cn } from '@/lib/utils';

// A 1px ring drawn as a gradient behind an inset fill, rather than a flat border — it catches light at the top-left and fades out,
// which is what stops a large card reading as a plain rectangle. Both the ring and the hard offset shadow beneath it are tokens, so
// the card carries the same construction on either ground: paper at low alpha is invisible on paper, and an ink shadow on near-black
// is nothing at all.
const RING = 'ring-edge rounded-lg p-px shadow-brutal';

export default function HoverVideoCard({ title, summary, media, className }) {
  const { videoRef, hoverHandlers } = useHoverVideo();
  return (
    <div className={cn(RING, className)}>
      {/* glass, not bg-black: the particle scene is fixed behind every section and has to read through the card. */}
      <div {...hoverHandlers} className='glass group flex h-full flex-col rounded-[calc(var(--radius)-1px)] p-5'>
        <div className='aspect-[9/10] w-full overflow-hidden'>
          <VideoSurface ref={videoRef} media={media} fit='contain' />
        </div>
        <div className='mt-auto flex flex-col gap-2 pt-5'>
          {/* Tokens, not literal paper. These resolve to paper on a dark ground and to ink on a paper one, which is the whole point
              of the `.on-paper` flip — a hardcoded white title is invisible the moment the section behind it turns light. */}
          <h3 className='text-2xl leading-none tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-volt'>
            {title}
          </h3>
          <p className='max-w-[46ch] text-sm leading-[1.6] text-mut'>{summary}</p>
        </div>
      </div>
    </div>
  );
}
