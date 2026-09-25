'use client';

import { useId, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { EllipsisVertical } from 'lucide-react';
import GlassPill from './GlassPill';
import { holdScroll } from '@/lib/scroll/lock';
import { cn } from '@/lib/utils';

const loadPanel = () => import('./MenuPanel');
const MenuPanel = dynamic(loadPanel, { ssr: false });

export default function MobileMenu({ ctaHref, onPaper, className }) {
  const panelId = useId();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(false);
  const change = (next) => {
    setOpen(next);
    holdScroll(next);
  };
  const openMenu = () => {
    setWanted(true);
    change(true);
  };
  const panelEl = wanted ? <MenuPanel id={panelId} open={open} onOpenChange={change} returnFocus={triggerRef} ctaHref={ctaHref} /> : null;
  return (
    <>
      <GlassPill
        as='button'
        ref={triggerRef}
        type='button'
        aria-label='Open menu'
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onPointerEnter={loadPanel}
        onTouchStart={loadPanel}
        onFocus={loadPanel}
        onClick={openMenu}
        className={cn('size-10 justify-center text-mut transition-colors duration-300', onPaper && 'bg-void/80', className)}
      >
        <EllipsisVertical className='size-5' aria-hidden='true' />
      </GlassPill>
      {panelEl}
    </>
  );
}
