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
    const release = (hold) => `bottom ${stage.current.offsetHeight + Math.round(window.innerHeight * hold)}px`;
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
            end: () => release(CTA.letter.hold),
            scrub: true,
          },
        }
      );
      const restX = () => {
        const words = line.current.querySelectorAll('[data-word]');
        const tail = words[words.length - 1].getBoundingClientRect();
        const origin = line.current.getBoundingClientRect().left;
        return window.innerWidth / 2 - (tail.left - origin + tail.width / 2);
      };
      gsap.fromTo(
        line.current,
        { x: () => window.innerWidth * CTA.sweep.headVw, y: () => stage.current.offsetHeight * CTA.sweep.dip },
        {
          x: restX,
          y: () => stage.current.offsetHeight * CTA.sweep.drop,
          ease: 'none',
          scrollTrigger: {
            trigger: frame.current,
            start: `top ${CTA.sweep.lead * 100}%`,
            end: () => release(CTA.sweep.hold),
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, frame);
    return () => context.revert();
  }, []);
  const wordEls = heading.split(' ').map((word, wordAt) => (
    <span key={`${word}-${wordAt}`} data-word='' className='flex'>
      {[...word].map((letter, letterAt) => (
        <span key={letterAt} data-letter='' className='will-change-transform'>
          {letter}
        </span>
      ))}
    </span>
  ));
  return (
    <Section variant='ink' compact className='px-0 py-0 md:px-0 md:py-0'>
      <div ref={frame} className='h-[90svh] lg:h-[160svh]'>
        <div ref={stage} className='sticky top-0 flex h-[50svh] items-start overflow-hidden lg:h-svh'>
          <h2
            ref={line}
            aria-label={heading}
            className='w-max font-sans text-[16vw] font-semibold leading-tight tracking-[-0.035em] text-paper will-change-transform'
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
