'use client';

import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';

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

export default function ProgressRing({ ref, width, height, visible, onPaper }) {
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const lengthRef = useRef(0);
  const progressRef = useRef(0);
  const outline = buildOutline(width, height);
  const stroke = onPaper ? 'var(--ink)' : 'var(--white)';
  const draw = useCallback((progress) => {
    const path = pathRef.current,
      head = headRef.current;
    if (!path || !head) return;
    progressRef.current = progress;
    path.setAttribute('stroke-dashoffset', 1 - progress);
    const point = path.getPointAtLength(progress * lengthRef.current);
    head.setAttribute('cx', point.x);
    head.setAttribute('cy', point.y);
  }, []);
  useImperativeHandle(ref, () => draw, [draw]);
  useEffect(() => {
    lengthRef.current = pathRef.current ? pathRef.current.getTotalLength() : 0;
    draw(progressRef.current);
  }, [outline, draw]);
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
        strokeDashoffset='1'
      />
      <circle ref={headRef} cx='0' cy='0' r='2.5' fill={stroke} />
    </svg>
  );
}
