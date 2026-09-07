'use client';

import Link from 'next/link';
import { Dialog } from 'radix-ui';
import { EllipsisVertical, X } from 'lucide-react';
import BrandMark from '../BrandMark';
import GlassPill from './GlassPill';
import { holdScroll } from '@/lib/scroll/lock';
import { cn } from '@/lib/utils';
import { NAV_CTA, NAV_LINKS, SITE } from '@/constants';

const OVERLAY =
  'fixed inset-0 z-50 bg-void/70 backdrop-blur-[3px] duration-300 data-open:animate-in data-open:fade-in-0 ' +
  'data-closed:animate-out data-closed:fade-out-0';
const PANEL =
  'border-brutal fixed inset-y-4 right-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[20px] ' +
  'bg-black shadow-brutal duration-300 ease-brutal data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-10 ' +
  'data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-10 md:inset-y-[30px] md:right-[30px]';
const ICON_BUTTON =
  'flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line text-mut transition-colors ' +
  'duration-200 hover:border-volt hover:text-paper';
const ITEM =
  'flex items-center justify-between border-b-[1.5px] border-line py-4 text-[1.375rem] leading-none tracking-[-0.02em] ' +
  'text-mut transition-colors duration-200 hover:text-paper';
const CTA =
  'border-brutal flex items-center justify-center rounded-full bg-volt px-5 py-3 text-sm font-semibold text-ink ' +
  'shadow-brutal-sm transition-colors duration-200 hover:bg-volt/85';

export default function MobileMenu({ className }) {
  const linkEls = NAV_LINKS.map(({ label, href }) => (
    <Dialog.Close key={href} asChild>
      <Link href={href} className={ITEM}>
        {label}
      </Link>
    </Dialog.Close>
  ));
  return (
    <Dialog.Root onOpenChange={holdScroll}>
      <Dialog.Trigger asChild>
        <GlassPill as='button' type='button' aria-label='Open menu' className={cn('size-10 justify-center text-mut', className)}>
          <EllipsisVertical className='size-5' aria-hidden='true' />
        </GlassPill>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={OVERLAY} />
        <Dialog.Content className={PANEL} aria-describedby={undefined}>
          <Dialog.Title className='sr-only'>Menu</Dialog.Title>
          <div className='flex items-center justify-between gap-4 border-b-[1.5px] border-line px-5 py-4'>
            <Dialog.Close asChild>
              <Link href='/' aria-label={`${SITE.name} home`} className='flex items-center gap-2 font-logo text-base leading-none'>
                <BrandMark size={24} className='shrink-0' />
                {SITE.name}
              </Link>
            </Dialog.Close>
            <Dialog.Close aria-label='Close menu' className={ICON_BUTTON}>
              <X className='size-4' aria-hidden='true' />
            </Dialog.Close>
          </div>
          <nav aria-label='Primary' className='flex min-h-0 flex-1 flex-col overflow-y-auto px-5'>
            {linkEls}
          </nav>
          <div className='flex flex-col px-5 pb-5 pt-6'>
            <Dialog.Close asChild>
              <Link href={NAV_CTA.href} className={CTA}>
                {NAV_CTA.label}
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
