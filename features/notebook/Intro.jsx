'use client';

import { useRef } from 'react';
import { chapters, notebook } from '@/lib/content/notebook';
import { useDirector } from './Director';
import Scene from './Scene';
import s from './styles.module.css';

export default function Intro() {
  const stage = useRef(null);
  const player = useDirector(stage);
  const { time, index, playing, sound, jump } = player;
  const [start, label, title, caption] = chapters[index];
  const end = chapters[index + 1]?.[0] ?? 60;
  const joined = time >= 17;
  return (
    <header className={s.stage} ref={stage}>
      <div className={s.mast}>
        <h1>{notebook.title}</h1>
        <a href='#archive' onClick={player.pause}>
          Skip introduction ↓
        </a>
      </div>
      <div className={s.book}>
        <div className={s.copy}>
          <small>GEEKINATE / FIELD NOTES</small>
          <div aria-live={playing ? 'off' : 'polite'}>
            <i>
              {String(index + 1).padStart(2, '0')} / {label}
            </i>
            <h2>{title}</h2>
            <p>{caption}</p>
          </div>
          <span>Studio archive</span>
        </div>
        <Scene
          index={index}
          progress={(time - start) / (end - start)}
          joined={joined}
          onJoin={() => jump(joined ? 13 : 17)}
          pause={player.pause}
        />
      </div>
      <nav className={s.ladder} aria-label='Story chapters'>
        {chapters.map(([at, name], i) => (
          <button key={name} onClick={() => jump(at)} aria-current={i === index ? 'step' : undefined}>
            {name}
          </button>
        ))}
      </nav>
      <div className={s.controls}>
        <button onClick={player.toggle}>{playing ? 'Pause' : time >= 60 ? 'Replay' : time ? 'Resume' : 'Play story'}</button>
        <input
          aria-label='Story position in seconds'
          type='range'
          min='0'
          max='60'
          step='.1'
          value={time}
          onChange={(event) => jump(Number(event.target.value))}
        />
        <output>{Math.floor(time)} / 60s</output>
        <button aria-pressed={sound} onClick={player.toggleSound}>
          Sound {sound ? 'on' : 'off'}
        </button>
      </div>
    </header>
  );
}
