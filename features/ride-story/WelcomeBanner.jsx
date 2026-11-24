'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sharedFieldbookSound as fx } from './soundEngine';
import r from './story.module.css';

gsap.registerPlugin(ScrollTrigger);

const WORDS = ['Welcome', 'to', 'Geekinate.'];

export default function WelcomeBanner() {
  const wrap = useRef(null);
  const track = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const letters = wrap.current.querySelectorAll('[data-w-letter]');
      const meta = wrap.current.querySelectorAll('[data-w-meta]');

      // 1. Immediate kinetic letter-by-letter entrance (matching features/cta signature motion)
      gsap.fromTo(
        letters,
        { yPercent: 115, rotate: 9, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          ease: 'power3.out',
          duration: 1.5,
          stagger: 0.055,
          clearProps: 'opacity',
        }
      );

      gsap.fromTo(
        meta,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          delay: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );

      // 2. Scroll-scrubbed horizontal sweep & exit transition into the paper fieldbook
      if (track.current) {
        gsap.to(track.current, {
          scale: 0.72,
          yPercent: -35,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.4,
          },
        });
      }
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <section className={`${r.welcomeHero} bg-black`} ref={wrap} aria-label='Welcome to Geekinate'>
      <div className={r.welcomeInner}>
        <h1 className={r.welcomeTitle} ref={track} aria-label='Welcome to Geekinate.'>
          <span aria-hidden='true' className={r.welcomeLine}>
            {WORDS.map((word, wIdx) => (
              <span key={word} className={wIdx === 2 ? r.welcomeWordVolt : r.welcomeWord}>
                {[...word].map((ch, cIdx) => (
                  <span key={cIdx} className={r.letterClip}>
                    <span data-w-letter='' className={r.letterGlyph}>
                      {ch}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>

        <p className={r.welcomeLead} data-w-meta=''>
          Four makers. Three core disciplines. One continuous story from the first studio notebook to today.
        </p>

        <div className={r.welcomeActions} data-w-meta=''>
          <a
            href='#story-top'
            className={r.welcomeBtn}
            onClick={() => {
              void fx.unlock().then((active) => {
                if (active) fx.playPageTurn();
              });
            }}
          >
            Enter the fieldbook ↓
          </a>
        </div>
      </div>

      {/* Tactile curved paper transition edge into the gridded fieldbook */}
      <div className={r.paperTransition} aria-hidden='true' />
    </section>
  );
}
