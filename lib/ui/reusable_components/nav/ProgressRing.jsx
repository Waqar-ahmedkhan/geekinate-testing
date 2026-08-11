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

// The ring is drawn on the pill's own outline, which sits exactly on the boundary between the volt pill and whatever section is
// behind it — so its colour cannot be fixed. Volt is out for the obvious reason once the pill went volt, and one neutral does not
// work either: it flips with the ground, paper over the dark sections and ink over the paper ones.
export default function ProgressRing({ width, height, progress, visible, onPaper }) {
  const pathRef = useRef(null);
  const [head, setHead] = useState(null);
  const outline = buildOutline(width, height);
  const stroke = onPaper ? 'var(--ink)' : 'var(--white)';
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
      <path d={outline} fill='none' stroke={stroke} strokeOpacity='0.18' strokeWidth='1' />
      <path
        ref={pathRef}
        d={outline}
        fill='none'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        pathLength='1'
        strokeDasharray='1'
        strokeDashoffset={1 - progress}
      />
      {head ? <circle cx={head.x} cy={head.y} r='2.5' fill={stroke} /> : null}
    </svg>
  );
}
