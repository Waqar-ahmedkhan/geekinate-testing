'use client';

import { useEffect, useRef } from 'react';
import { campaignFields, referrerDomain, track } from '@/lib/analytics';
import { PARTNER, PARTNER_EVENTS } from '@/constants';

const HALF = 0.5;
const STEPS = [0, 0.25, 0.5, 0.75, 1];

export default function Analytics() {
  const viewedRef = useRef(false);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    track(PARTNER_EVENTS.pageView, { path: PARTNER.path, referrer_domain: referrerDomain(), ...campaignFields() });
  }, []);

  useEffect(() => {
    const nodes = PARTNER.trackedSections.map((id) => document.getElementById(id)).filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, intersectionRect, boundingClientRect }) => {
          const reach = Math.min(boundingClientRect.height, window.innerHeight) * HALF;
          if (intersectionRect.height < reach) return;
          track(PARTNER_EVENTS.sectionView, { section_id: target.id });
          observer.unobserve(target);
        });
      },
      { threshold: STEPS }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
