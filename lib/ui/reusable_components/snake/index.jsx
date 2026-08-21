'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function SnakeCanvas() {
  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 z-40'>
      <Scene />
    </div>
  );
}
