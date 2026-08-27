'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Section } from '@/components';
import { ctaContent } from '@/lib/content';
import { CTA } from '@/constants';

gsap.registerPlugin(ScrollTrigger);

export default function Cta() {
  const { heading } = ctaContent;
  const frame = useRef(null);
  const stage = useRef(null);
  const line = useRef(null);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const view = () => window.innerHeight;
    const context = gsap.context(() => {
      const letters = line.current.querySelectorAll('[data-letter]');
      gsap.fromTo(
        letters,
        { yPercent: CTA.letter.shift, rotate: CTA.letter.tilt },
        {
          yPercent: 0,
          rotate: 0,
          ease: `back.inOut(${CTA.letter.overshoot})`,
          duration: CTA.letter.settle,
          stagger: CTA.letter.stagger,
          scrollTrigger: {
            trigger: frame.current,
            start: `top ${CTA.letter.lead * 100}%`,
            end: () => `bottom bottom+=${Math.round(view() * CTA.letter.hold)}`,
            scrub: true,
          },
        }
      );
      gsap.fromTo(
        line.current,
        { x: () => window.innerWidth * CTA.sweep.headVw, y: 0 },
        {
          x: () => window.innerWidth * CTA.sweep.tailVw - line.current.scrollWidth,
          y: () => stage.current.offsetHeight * CTA.sweep.drop,
          ease: 'none',
          scrollTrigger: {
            trigger: frame.current,
            start: `top ${CTA.sweep.lead * 100}%`,
            end: () => `bottom bottom+=${Math.round(view() * CTA.sweep.hold)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, frame);
    return () => context.revert();
  }, []);
  const wordEls = heading.split(' ').map((word, wordAt) => (
    <span key={`${word}-${wordAt}`} className='flex'>
      {[...word].map((letter, letterAt) => (
        <span key={letterAt} data-letter='' className='will-change-transform'>
          {letter}
        </span>
      ))}
    </span>
  ));
  return (
    <Section variant='ink' className='px-0 py-0 md:px-0 md:py-0'>
      <div ref={frame} className='h-[135svh] lg:h-[240svh]'>
        <div ref={stage} className='sticky top-0 flex h-[35svh] items-start overflow-hidden lg:h-svh'>
          <h2
            ref={line}
            aria-label={heading}
            className='w-max font-sans text-[30vw] font-medium leading-tight tracking-[-0.035em] text-paper will-change-transform lg:text-[16vw]'
          >
            <span aria-hidden='true' className='flex gap-[0.24em]'>
              {wordEls}
            </span>
          </h2>
        </div>
      </div>
    </Section>
  );
}
