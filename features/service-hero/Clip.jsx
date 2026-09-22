'use client';

import { useHoverVideo, VideoSurface } from '@/lib/ui/reusable_components';

const SLOT = 'mx-auto aspect-square w-full max-w-sm ground-patch lg:max-w-none';

export default function Clip({ media }) {
  const { videoRef, hoverHandlers } = useHoverVideo({ introduce: true });
  return (
    <div {...hoverHandlers} className={SLOT}>
      <VideoSurface ref={videoRef} media={media} loop={false} className='mix-blend-screen' />
    </div>
  );
}
