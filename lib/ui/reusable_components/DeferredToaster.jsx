'use client';

import dynamic from 'next/dynamic';
import useSettled from './useSettled';

const Toaster = dynamic(() => import('@/components/ui/sonner').then((module) => module.Toaster), { ssr: false });

export default function DeferredToaster() {
  const settled = useSettled();
  return settled ? <Toaster /> : null;
}
