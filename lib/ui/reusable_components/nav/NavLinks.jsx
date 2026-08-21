'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const HIGHLIGHT_TRANSITION = `transform 360ms ${EASE}, width 360ms ${EASE}, height 360ms ${EASE}, opacity 200ms linear`;

export default function NavLinks({ items, className }) {
  const listRef = useRef(null);
  const [highlight, setHighlight] = useState(null);
  const track = (event) => {
    const list = listRef.current;
    if (!list) return;
    const item = event.currentTarget.getBoundingClientRect();
    const bounds = list.getBoundingClientRect();
    const x = item.left - bounds.left + list.scrollLeft;
    setHighlight({ x: Math.round(x), width: Math.round(item.width), height: Math.round(item.height) });
  };
  const clear = () => setHighlight(null);
  const highlightStyle = {
    transition: HIGHLIGHT_TRANSITION,
    opacity: highlight ? 1 : 0,
    width: highlight ? `${highlight.width}px` : 0,
    height: highlight ? `${highlight.height}px` : 0,
    transform: `translate(${highlight ? highlight.x : 0}px, -50%)`,
  };
  return (
    <ul ref={listRef} onMouseLeave={clear} onBlur={clear} className={cn('relative flex items-center whitespace-nowrap', className)}>
      <span className='pointer-events-none absolute left-0 top-1/2 rounded-full bg-paper/[0.09]' style={highlightStyle} />
      {items.map(({ label, href }) => (
        <li key={href} className='relative'>
          <Link
            href={href}
            onMouseEnter={track}
            onFocus={track}
            className='block rounded-full px-1.5 py-1.5 text-xs font-medium text-paper/60 transition-colors duration-200 hover:text-paper sm:px-[14px] sm:text-sm'
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
