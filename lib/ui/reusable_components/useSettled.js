'use client';

import { useEffect, useState } from 'react';
import { watchSettled } from '@/lib/boot/settled';

export default function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => watchSettled(() => setSettled(true)), []);
  return settled;
}
