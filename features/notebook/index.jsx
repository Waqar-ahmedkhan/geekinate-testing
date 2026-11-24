'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notebook } from '@/lib/content/notebook';
import { work } from '@/lib/content/work';
import { serviceNames } from '@/lib/content/shared';
import Intro from './Intro';
import s from './styles.module.css';

export default function Notebook() {
  const [filter, setFilter] = useState('');
  const projects = work.filter((project) => !filter || project.service === filter);
  return (
    <div className={s.paper}>
      <Intro />
      <section id='archive' className={s.section}>
        <h2>Inside the studio notebook</h2>
        <ol className={s.archive}>
          {notebook.milestones.map(([date, title, body, image]) => (
            <li key={date}>
              <time>{date}</time>
              <details>
                <summary>{title}</summary>
                <p>{body}</p>
                <Image src={image} width={400} height={225} alt='Studio project artifact' />
              </details>
            </li>
          ))}
        </ol>
      </section>
      <section id='atlas' className={s.section}>
        <h2>Project atlas</h2>
        <div className={s.filters}>
          {['', ...Object.keys(serviceNames)].map((key) => (
            <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {serviceNames[key]?.title ?? 'All projects'}
            </button>
          ))}
        </div>
        <div className={s.cards}>
          {projects.map(({ slug, title, media, href, disciplines }) => (
            <a href={href} key={slug}>
              <Image src={media.poster} alt='' width={480} height={300} />
              <small>{disciplines.join(' · ')}</small>
              <h3>{title} ↗</h3>
            </a>
          ))}
        </div>
      </section>
      <section className={s.section}>
        <h2>Inside the design process</h2>
        <div className={s.process}>
          {work[0].brief.solution.slice(0, 3).map(({ title, detail }) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
      <aside className={s.final}>
        <i>The next page is yours.</i>
        <a href='#contact'>Let’s talk ↗</a>
      </aside>
    </div>
  );
}
