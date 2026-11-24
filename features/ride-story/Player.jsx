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
const easeOutBack = (t, s = 1.65) => {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
};

const MAP_PINS = [
  { x: 168, y: 270 },
  { x: 377, y: 87 },
  { x: 593, y: 230 },
  { x: 848, y: 252 },
];
const LIVE_ROUTE = 'M168 270 L266 249 L289 253 L253 110 L377 87 L455 171 L524 161 L593 230 L721 228 L731 275 L848 252';
const RAYS = Array.from({ length: 16 }, (_, i) => i);
const FINALE = { burstAt: 1.4, burstDuration: 0.85, stickersAt: 2.15, stagger: 0.28, settle: 0.38 };

// Each maker enters from a different edge: Hamza left, Bilal top, Zain right, Rayan bottom.
const ENTRY = {
  usama: { dur: 0.8, x: -145, y: 0, rot: -3 },
  adil: { dur: 0.85, x: 0, y: -145, rot: 2 },
  nouman: { dur: 0.8, x: 265, y: 0, rot: 3 },
  waqar: { dur: 0.85, x: 0, y: 135, rot: -2 },
};
const YEAR_DELAY = 0.12;

function pose(id, t) {
  const eased = easeOutBack(t, 0.5);
  const from = ENTRY[id];

  return {
    x: from.x * (1 - eased),
    y: from.y * (1 - eased),
    rot: from.rot * (1 - easeOutCubic(t)),
    scale: 0.98 + 0.02 * eased,
    opacity: t > 0 ? 1 : 0,
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

  const routeDraw = reduced ? 1 : clamp01((time - startOf(1) + 0.6) / (startOf(5) - startOf(1)));
  const flash = isFinale && !reduced ? clamp01(1 - Math.abs(local - FINALE.burstAt) / 0.18) * 0.12 : 0;
  const rays = isFinale ? (reduced ? 1 : easeOutCubic(clamp01((local - FINALE.burstAt) / FINALE.burstDuration))) : 0;

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
        at(s + FINALE.burstAt, () => fx.playGlideIn());
        item.people.forEach((_, idx) => at(s + FINALE.stickersAt + idx * FINALE.stagger, () => fx.playStickerSlap(idx)));
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

    const pause = () => {
      clock.pause();
      fx.stopStory();
      setPlaying(false);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        setReady(true);
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        if (visible && !wasVisible.current && !query.matches) {
          clock.restart();
          setPlaying(true);
        } else if (!visible) pause();
        wasVisible.current = visible;
      },
      { threshold: 0.35 }
    );
    observer.observe(stage.current);
    const visibility = () => document.hidden && pause();
    document.addEventListener('visibilitychange', visibility);

    return () => {
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
            <h2 className={r.introTitle} key='intro' style={titleStyle}>
              A studio built by makers.
            </h2>
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
            <div className={r.crewStamp} style={{ opacity: reduced ? 1 : clamp01((local - 3.4) / 0.5) }} aria-hidden='true'>
              THE CREW IN STICKERS
            </div>
          )}

          <div className={r.mapStage}>
            <div className={r.mapCanvas}>
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
                  if (pinChapter > index) return null;
                  return (
                    <circle
                      key={pin.x}
                      cx={pin.x}
                      cy={pin.y - 10}
                      r='16'
                      fill='none'
                      stroke='#b8e01b'
                      strokeWidth='2.5'
                      className={!reduced && playing && pinChapter === index ? r.sonarRing : undefined}
                    />
                  );
                })}
              </svg>
            </div>

            {/* 2026 finale: volt-and-paper sunburst behind the crew */}
            {isFinale && (
              <svg
                className={r.sunburst}
                viewBox='-100 -100 200 200'
                preserveAspectRatio='xMidYMax slice'
                style={{ opacity: Math.min(1, rays), transform: `scale(${0.6 + 0.4 * rays})` }}
                aria-hidden='true'
              >
                {RAYS.map((i) => (
                  <path
                    key={i}
                    d='M0 0 L-9 -150 L9 -150 Z'
                    transform={`rotate(${i * 22.5 - 90})`}
                    fill={i % 2 ? '#fdfdfb' : '#b8e01b'}
                    opacity={i % 2 ? 0.9 : 0.75}
                  />
                ))}
              </svg>
            )}

            <div className={r.cutouts}>
              {chapter.people.map((id, i) => {
                const person = people[id];
                const isNew = !chapters[index - 1]?.people.includes(id);
                const entryDur = ENTRY[id].dur;
                const t = reduced || !isNew ? 1 : clamp01((local - motion.arrival) / entryDur);
                const p = pose(id, t);
                const yearT = reduced || !isNew ? 1 : clamp01((local - (motion.arrival + entryDur + YEAR_DELAY)) / 0.35);
                const slapT = !isFinale ? 0 : reduced ? 1 : clamp01((local - (FINALE.stickersAt + i * FINALE.stagger)) / FINALE.settle);
                const tilt = [-3, 2, -2, 3][i % 4];

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
                        transform: `translateX(-50%) rotate(-1.5deg) scale(${yearT ? easeOutCubic(yearT) : 0.6})`,
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
                          opacity: clamp01(slapT * 3),
                          transform: `translateX(-50%) rotate(${slapT ? tilt + (1 - easeOutCubic(slapT)) * -12 : -14}deg) scale(${slapT ? 1 + (1 - easeOutBack(slapT, 1.5)) * 0.75 : 1.8})`,
                        }}
                      >
                        {person.name}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {flash > 0 && <span className={r.cameraFlash} style={{ opacity: flash }} aria-hidden='true' />}
          </div>
        </div>

        <a href='#team' className={r.scrollCue}>
          ↓ Scroll for the team & logbook
        </a>
      </div>
    </header>
  );
}
