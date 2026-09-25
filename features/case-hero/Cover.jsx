'use client';

import { InViewVideo, useHoverVideo, VideoSurface } from '@/lib/ui/reusable_components';

const FILL = 'absolute inset-0';

export default function Cover({ media }) {
  const { loop = true } = media;
  const { videoRef } = useHoverVideo({ introduce: !loop });
  if (loop) return <InViewVideo media={media} loop className={FILL} />;
  return <VideoSurface ref={videoRef} media={media} fit='cover' loop={false} className={FILL} />;
}
