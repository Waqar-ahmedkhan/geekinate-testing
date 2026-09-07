'use client';

import Link from 'next/link';
import { ctaSource, track } from '@/lib/analytics';
import { chooseIntent } from '@/lib/partner/intent';
import { PARTNER_EVENTS } from '@/constants';

export default function TrackedLink({ href, location, label, intent, event = PARTNER_EVENTS.ctaClick, className, children }) {
  const conversion = event === PARTNER_EVENTS.ctaClick;
  const report = () => {
    if (conversion && location) ctaSource.value = location;
    track(event, conversion ? { cta_label: label, cta_location: location, intent } : { cta_location: location });
    if (intent) chooseIntent(intent);
  };
  return (
    <Link href={href} onClick={report} className={className}>
      {children}
    </Link>
  );
}
