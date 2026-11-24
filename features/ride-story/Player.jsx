'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { chapters, people, sceneMotion } from '@/lib/content/ride-story/story-data';
import { beats } from '@/lib/content/ride-story/story-copy';
import { sharedFieldbookSound as fx } from './soundEngine';
import r from './story.module.css';

const ends = chapters.reduce((list, chapter) => [...list, (list.at(-1) ?? 0) + chapter.duration], []);
const duration = ends.at(-1);
const startOf = (index) => ends[index] - chapters[index].duration;

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const MAP_PINS = [
  { x: 168, y: 270 },
  { x: 377, y: 87 },
  { x: 593, y: 230 },
  { x: 848, y: 252 },
];
const LIVE_ROUTE = 'M168 270 L266 249 L289 253 L253 110 L377 87 L455 171 L524 161 L593 230 L721 228 L731 275 L848 252';
const RAYS = Array.from({ length: 24 }, (_, i) => i);
const FINALE = { glowAt: 0.25, burstDuration: 0.9, cardsAt: 0.55, stagger: 0.16, settle: 0.5 };

// Each maker enters in 3 steps: angled arc swoop -> overshoot pop -> crisp settle.
const ENTRY = {
  usama: { dur: 0.92, x: -95, y: 18, rot: -10, arcY: -12 },
  adil: { dur: 0.95, x: 18, y: -88, rot: 9, arcY: 0 },
  nouman: { dur: 0.92, x: 110, y: 16, rot: 10, arcY: -12 },
  waqar: { dur: 0.95, x: -16, y: 88, rot: -9, arcY: 0 },
};
const CAMERA_PAN = {
  intro: 'scale(1) translate3d(0, 0, 0)',
  origin: 'scale(1.06) translate3d(2.2%, -1.2%, 0)',
  engineering: 'scale(1.07) translate3d(0.8%, 1.8%, 0)',
  growth: 'scale(1.07) translate3d(-1.4%, 0.5%, 0)',
  interactive: 'scale(1.06) translate3d(-2.2%, -1%, 0)',
  studio: 'scale(1) translate3d(0, 0, 0)',
};
const YEAR_DELAY = 0.08;

function pose(id, t) {
  const from = ENTRY[id];
  if (t <= 0) {
    return { x: from.x, y: from.y, rot: from.rot, scale: 0.78, opacity: 0 };
  }
  if (t < 0.62) {
    // Step 1: Angled arc swoop toward target with slight overshoot
    const p = easeOutCubic(t / 0.62);
    const arc = Math.sin(p * Math.PI) * from.arcY;
    return {
      x: from.x * (1 - p) - Math.sign(from.x || 1) * 3.5 * p,
      y: from.y * (1 - p) + arc - 2 * p,
      rot: from.rot * (1 - p) + -from.rot * 0.22 * p,
      scale: 0.78 + 0.26 * p,
      opacity: clamp01(p * 1.6),
    };
  }
  // Step 2 & 3: Crisp counter-angle settle & micro-scale lock
  const s = easeOutCubic((t - 0.62) / 0.38);
  return {
    x: -Math.sign(from.x || 1) * 3.5 * (1 - s),
    y: -2 * (1 - s),
    rot: -from.rot * 0.22 * (1 - s),
    scale: 1.04 - 0.04 * s,
    opacity: 1,
  };
}

export default function Player() {
  const stage = useRef(null);
  const timeline = useRef(null);
  const wasVisible = useRef(false);
  const [sound, setSound] = useState(true);
  const [time, setTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  const nextIndex = ends.findIndex((end) => time < end);
  const index = nextIndex === -1 ? chapters.length - 1 : nextIndex;
  const chapter = chapters[index];
  const motion = sceneMotion[chapter.id];
  const local = Math.max(0, time - startOf(index));
  const beat = beats[chapter.id];
  const textEntrance = !ready || reduced ? 1 : easeOutCubic(clamp01(local / 0.9));
  const textExit = reduced || index === chapters.length - 1 ? 1 : clamp01((chapter.duration - local) / 0.4);
  const captionEntrance = !ready || reduced ? 1 : easeOutCubic(clamp01((local - 0.15) / 0.9));
  const titleStyle = { opacity: textEntrance * textExit, transform: `translateY(${(1 - textEntrance) * 16 - (1 - textExit) * 8}px)` };
  const captionStyle = {
    opacity: captionEntrance * textExit,
    transform: `translateY(${(1 - captionEntrance) * 12 - (1 - textExit) * 6}px)`,
  };
  const isIntro = chapter.id === 'intro';
  const isFinale = chapter.id === 'studio';

  const routeDraw = reduced ? 1 : clamp01(time / startOf(5));
  const finaleGlow = isFinale ? (reduced ? 1 : easeOutCubic(clamp01((local - FINALE.glowAt) / 0.85))) : 0;
  const rays = isFinale ? (reduced ? 1 : easeOutCubic(clamp01((local - FINALE.glowAt) / FINALE.burstDuration))) : 0;

  useEffect(() => {
    const syncSound = (event) => setSound(event.detail);
    window.addEventListener('fieldbook-sound', syncSound);
    const unlock = () => {
      void fx.unlock();
    };
    const onKey = (event) => {
      if (event.key === 'Enter' || event.key === ' ') unlock();
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', onKey);
    unlock();
    const cursor = { time: 0 };
    const clock = gsap.timeline({
      paused: true,
      onUpdate: () => setTime(cursor.time),
      repeat: -1,
      repeatDelay: 0.8,
    });
    clock.to(cursor, { time: duration, duration, ease: 'none' });
    const at = (t, fn) => clock.call(() => !clock.paused() && fn(), [], t);

    chapters.forEach((item, i) => {
      const s = startOf(i);
      const m = sceneMotion[item.id];
      at(s + 0.08, () => (i === 0 ? fx.playChapterChord(0) : fx.playYearStamp()));
      at(s + 0.3, () => fx.playPageTurn());

      const newcomer = item.people.find((id) => !chapters[i - 1]?.people.includes(id));
      if (newcomer && item.id !== 'studio') {
        const entry = ENTRY[newcomer];
        at(s + m.arrival, () => fx.playPortraitWhoosh(entry.dur, i));
        at(s + m.arrival + entry.dur, () => fx.playStickerSlap(i));
      }
      if (item.id === 'studio') {
        at(s + FINALE.glowAt, () => fx.playGlideIn());
        item.people.forEach((_, idx) => at(s + FINALE.cardsAt + idx * FINALE.stagger, () => fx.playStickerSlap(idx)));
      }
    });
    timeline.current = clock;

    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => {
      setReduced(query.matches);
      if (query.matches) {
        clock.pause();
        fx.stopStory();
        setPlaying(false);
      }
    };
    preference();
    query.addEventListener('change', preference);

    const startRaf = requestAnimationFrame(() => {
      setReady(true);
      if (!query.matches) {
        clock.restart();
        setPlaying(true);
        wasVisible.current = true;
      }
    });

    const pause = () => {
      clock.pause();
      fx.stopStory();
      setPlaying(false);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (visible && !wasVisible.current && !query.matches) {
          clock.play();
          setPlaying(true);
        } else if (!visible) pause();
        wasVisible.current = visible;
      },
      { threshold: 0.25 }
    );
    observer.observe(stage.current);
    const visibility = () => document.hidden && pause();
    document.addEventListener('visibilitychange', visibility);

    return () => {
      cancelAnimationFrame(startRaf);
      window.removeEventListener('fieldbook-sound', syncSound);
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', onKey);
      clock.kill();
      fx.stopStory();
      timeline.current = null;
      wasVisible.current = false;
      observer.disconnect();
      query.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  async function unlockSound() {
    await fx.unlock();
  }

  async function toggle() {
    if (playing) {
      timeline.current?.pause();
      fx.stopStory();
      setPlaying(false);
      fx.playUiTap();
      return;
    }
    await unlockSound();
    if (time >= duration - 0.05) timeline.current?.restart();
    else timeline.current?.play();
    setPlaying(true);
    const newcomer = chapter.people.find((id) => !chapters[index - 1]?.people.includes(id));
    const remaining = newcomer ? motion.arrival + ENTRY[newcomer].dur - local : 0;
    if (newcomer && local >= motion.arrival && remaining > 0 && !isFinale) {
      fx.playPortraitWhoosh(remaining, index);
    } else fx.playUiTap();
  }

  async function toggleSound() {
    if (sound) {
      fx.disable();
      setSound(false);
      return;
    }
    await fx.enable();
    fx.playUiTap();
  }

  return (
    <header className={r.mapOpening} id='story-top' ref={stage}>
      <div className={r.stageFrame}>
        <div className={r.controlRow}>
          <button type='button' className={r.playPill} disabled={!ready} onClick={() => void toggle()}>
            <span className={r.playDot} data-playing={playing} aria-hidden='true' />
            {!ready ? 'Loading…' : playing ? 'Pause' : time >= duration - 0.05 ? 'Replay' : 'Play'}
          </button>
          <button type='button' className={r.soundPill} aria-pressed={sound} onClick={() => void toggleSound()}>
            <span className={r.eqBars} data-active={sound && playing} aria-hidden='true'>
              <i />
              <i />
              <i />
            </span>
            Sound {sound ? 'on' : 'off'}
          </button>
        </div>

        <div className={r.heroCopy}>
          {isIntro ? (
            <h1 className={r.introTitle} key='intro' style={titleStyle}>
              A studio built by makers.
            </h1>
          ) : (
            <div className={r.yearStamp} key={'year-' + chapter.id} style={titleStyle}>
              {chapter.year}
            </div>
          )}
          <p className={r.captionLine} key={'caption-' + chapter.id} style={captionStyle}>
            {beat.narration}
          </p>
        </div>

        <div className={r.mapStageWrap}>
          {isFinale && (
            <div className={r.crewStamp} style={{ opacity: finaleGlow }} aria-hidden='true'>
              FOUR MAKERS · ONE STUDIO
            </div>
          )}

          <div className={r.mapStage}>
            <div className={r.mapCanvas} style={{ transform: reduced ? undefined : CAMERA_PAN[chapter.id] }}>
              <Image
                className={r.district}
                src='/media/fieldbook/district.svg'
                alt='Illustrated fieldbook map connecting Geekinate milestones'
                width={1000}
                height={390}
                priority
              />
              <svg className={r.liveRouteSvg} viewBox='0 0 1000 390' aria-hidden='true'>
                <path
                  d={LIVE_ROUTE}
                  fill='none'
                  stroke='#b8e01b'
                  strokeWidth='5'
                  strokeLinecap='round'
                  pathLength='1'
                  strokeDasharray={`${routeDraw} 2`}
                />
                {MAP_PINS.map((pin, p) => {
                  const pinChapter = p + 1;
                  const isActivePin = index === 0 ? p === 0 : pinChapter === index;
                  if (index > 0 && pinChapter > index) return null;
                  return (
                    <circle
                      key={pin.x}
                      cx={pin.x}
                      cy={pin.y - 10}
                      r='16'
                      fill='none'
                      stroke='#b8e01b'
                      strokeWidth='2.5'
                      className={!reduced && playing && isActivePin ? r.sonarRing : undefined}
                    />
                  );
                })}
              </svg>
            </div>

            {/* 2026 finale: refined volt-and-paper radiating lines + ambient glow */}
            {isFinale && (
              <>
                <div className={r.finaleGlow} style={{ opacity: finaleGlow }} aria-hidden='true' />
                <svg
                  className={r.sunburst}
                  viewBox='-100 -100 200 200'
                  preserveAspectRatio='xMidYMax slice'
                  style={{ opacity: Math.min(1, rays), transform: `scale(${0.72 + 0.28 * rays})` }}
                  aria-hidden='true'
                >
                  {RAYS.map((i) => (
                    <path
                      key={i}
                      d='M0 0 L-5.5 -150 L5.5 -150 Z'
                      transform={`rotate(${i * 15 - 90})`}
                      fill={i % 2 ? '#fdfdfb' : '#b8e01b'}
                      opacity={i % 2 ? 0.72 : 0.58}
                    />
                  ))}
                </svg>
              </>
            )}

            <div className={r.cutouts}>
              {chapter.people.map((id, i) => {
                const person = people[id];
                const isNew = !chapters[index - 1]?.people.includes(id);
                const entryDur = ENTRY[id].dur;
                const t = reduced || !isNew ? 1 : clamp01((local - motion.arrival) / entryDur);
                const p = pose(id, t);
                const yearT = reduced || !isNew ? 1 : clamp01((local - (motion.arrival + entryDur + YEAR_DELAY)) / 0.35);
                const badgeT = !isFinale
                  ? 0
                  : reduced
                    ? 1
                    : easeOutCubic(clamp01((local - (FINALE.cardsAt + i * FINALE.stagger)) / FINALE.settle));

                return (
                  <a
                    key={id}
                    href={'#person-' + id}
                    className={r.cutoutCard}
                    style={{
                      opacity: p.opacity,
                      visibility: p.opacity > 0.01 ? 'visible' : 'hidden',
                      transform: `translate3d(${p.x}%, ${p.y}%, 0) rotate(${p.rot}deg) scale(${p.scale})`,
                    }}
                  >
                    <em
                      className={r.yearTag}
                      style={{
                        opacity: yearT,
                        transform: `translateX(-50%) scale(${yearT ? 0.85 + 0.15 * easeOutCubic(yearT) : 0.85})`,
                      }}
                    >
                      {person.year}
                    </em>
                    <Image src={person.cutout} width={320} height={360} alt={`${person.name}, ${person.role}`} className={r.cutoutImg} />
                    {isFinale && (
                      <span
                        className={r.nameSticker}
                        data-finale='true'
                        style={{
                          opacity: badgeT,
                          transform: `translateX(-50%) translateY(${(1 - badgeT) * 10}px)`,
                        }}
                      >
                        {person.name}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {!reduced && <div key={chapter.id} className={r.chapterWipe} aria-hidden='true' />}

            <div
              className={r.stageHairline}
              style={{ width: `${Math.min(100, (time / duration) * 100)}%` }}
              aria-hidden='true'
            />
          </div>
        </div>
      </div>
    </header>
  );
}
