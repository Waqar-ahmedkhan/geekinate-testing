'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sharedFieldbookSound } from './soundEngine';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // 1. Section headers slide in crisply
      gsap.utils.toArray('[data-reveal="heading"]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // 2. Team Polaroid cards drop onto the desk in a staggered wave
      const polaroids = gsap.utils.toArray('[data-reveal="polaroid"]');
      if (polaroids.length) {
        gsap.fromTo(
          polaroids,
          {
            opacity: 0,
            y: 58,
            scale: 0.92,
            rotation: (i) => (i % 2 === 0 ? -7 : 7),
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: polaroids[0].parentElement,
              start: 'top 84%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // 3. Achievements strip cards pop in staggered + animate numeric count-up
      const stats = gsap.utils.toArray('[data-reveal="stat"]');
      if (stats.length) {
        gsap.fromTo(
          stats,
          { opacity: 0, y: 44, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: stats[0].parentElement,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        stats.forEach((card) => {
          const numEl = card.querySelector('[data-count-to]');
          if (!numEl) return;
          const target = Number(numEl.getAttribute('data-count-to'));
          const suffix = numEl.getAttribute('data-count-suffix') || '';
          const counter = { val: 0 };
          gsap.to(counter, {
            val: target,
            duration: 1.15,
            ease: 'power2.out',
            onUpdate: () => {
              numEl.textContent = `${Math.round(counter.val)}${suffix}`;
            },
            scrollTrigger: {
              trigger: card,
              start: 'top 86%',
              once: true,
            },
          });
        });
      }

      // 4. Live scroll-scrubbed Volt progress line down the center of the Logbook
      const spineFill = document.querySelector('[data-spine-fill]');
      const ledger = spineFill?.closest('ol');
      if (spineFill && ledger) {
        gsap.fromTo(
          spineFill,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: ledger,
              start: 'top 72%',
              end: 'bottom 78%',
              scrub: 0.3,
            },
          }
        );
      }

      // 5. Alternating Logbook milestone cards slide & tilt in + spine node pops
      gsap.utils.toArray('[data-reveal="left"], [data-reveal="right"]').forEach((el) => {
        const isLeft = el.getAttribute('data-reveal') === 'left';
        const card = el.querySelector('[data-ledger-card]') || el;
        const node = el.querySelector('[data-spine-node]');
        const polaroid = el.querySelector('[data-parallax-polaroid]');

        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isLeft ? -64 : 64,
            y: 26,
            rotation: isLeft ? -3 : 3,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.72,
            onStart: () => {
              if (polaroid) sharedFieldbookSound.playTimelineReveal();
            },
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        if (node) {
          gsap.fromTo(
            node,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.45,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }

        if (polaroid) {
          gsap.fromTo(
            polaroid,
            { y: 12 },
            {
              y: -12,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
              },
            }
          );
        }
      });

      // 6. Closing "Now it's your turn" taped sheet + Polaroid drop
      const sheet = document.querySelector('[data-reveal="sheet"]');
      if (sheet) {
        gsap.fromTo(
          sheet,
          { opacity: 0, y: 54, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: sheet,
              start: 'top 86%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      const photoFrame = document.querySelector('[data-reveal="your-photo"]');
      if (photoFrame) {
        gsap.fromTo(
          photoFrame,
          { opacity: 0, y: 36, rotation: -8, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            rotation: -2,
            scale: 1,
            duration: 0.75,
            delay: 0.15,
            ease: 'back.out(1.6)',
            clearProps: 'opacity',
            scrollTrigger: {
              trigger: photoFrame,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, []);

  return null;
}
