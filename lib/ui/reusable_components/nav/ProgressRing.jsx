'use client';

import { useEffect, useRef, useState } from 'react';

// Capsule outline split at top centre and drawn clockwise, so progress grows out of the middle of the pill's top edge.
const buildOutline = (width, height) => {
  const radius = height / 2;
  const mid = width / 2;
  return [
    `M ${mid} 0`,
    `L ${width - radius} 0`,
    `A ${radius} ${radius} 0 0 1 ${width} ${radius}`,
    `A ${radius} ${radius} 0 0 1 ${width - radius} ${height}`,
    `L ${radius} ${height}`,
    `A ${radius} ${radius} 0 0 1 0 ${radius}`,
    `A ${radius} ${radius} 0 0 1 ${radius} 0`,
    `L ${mid} 0`,
  ].join(' ');
};

export default function ProgressRing({ width, height, progress, visible }) {
  const pathRef = useRef(null);
  const [head, setHead] = useState(null);
  const outline = buildOutline(width, height);
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const point = path.getPointAtLength(progress * path.getTotalLength());
    setHead({ x: point.x, y: point.y });
  }, [outline, progress]);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden='true'
      className='pointer-events-none absolute left-0 top-0 overflow-visible'
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 600ms cubic-bezier(0.65, 0, 0.35, 1)' }}
    >
      <path d={outline} fill='none' stroke='var(--ink)' strokeOpacity='0.06' strokeWidth='1' />
      <path
        ref={pathRef}
        d={outline}
        fill='none'
        stroke='var(--volt)'
        strokeWidth='1.5'
        strokeLinecap='round'
        pathLength='1'
        strokeDasharray='1'
        strokeDashoffset={1 - progress}
      />
      {head ? <circle cx={head.x} cy={head.y} r='2.5' fill='var(--volt)' /> : null}
    </svg>
  );
}
