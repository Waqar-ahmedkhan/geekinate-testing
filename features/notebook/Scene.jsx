import Image from 'next/image';
import { teamContent } from '@/lib/content/team';
import { work } from '@/lib/content/work';
import s from './styles.module.css';

function MapDrawing({ index, progress }) {
  const path = 'M 12 175 C 65 175 69 110 114 110 S 165 148 203 105 L 277 40';
  const length = index ? 1 : 0.22 + 0.78 * progress;
  return (
    <svg className={s.map} viewBox='0 0 300 210' aria-hidden='true'>
      <defs>
        <pattern id='blocks' width='42' height='35' patternTransform='rotate(-14)' patternUnits='userSpaceOnUse'>
          <rect x='3' y='4' width='32' height='24' rx='3' fill='var(--wash)' stroke='currentColor' strokeOpacity='.25' />
        </pattern>
      </defs>
      <rect width='300' height='210' fill='url(#blocks)' opacity={index ? 1 : 0.4} />
      <path d={path} fill='none' stroke='var(--volt)' strokeWidth='9' pathLength='1' strokeDasharray={length + ' 2'} />
      <path d={path} fill='none' stroke='currentColor' strokeWidth='1.5' pathLength='1' strokeDasharray={length + ' 2'} />
      <circle r='4' fill='currentColor' style={{ offsetPath: 'path("' + path + '")', offsetDistance: length * 100 + '%' }} />
    </svg>
  );
}

export default function Scene({ index, progress, joined, onJoin, pause }) {
  const product = work[0];
  const proof = work.find((project) => project.slug === 'shifa-international');
  return (
    <div className={s.leaf}>
      <MapDrawing index={index} progress={progress} />
      {index < 2 && <i className={s.annotation}>{index ? 'Wordmark → space → booking' : 'The first pencil mark'}</i>}
      {index === 2 && (
        <div className={s.sleeve}>
          <div className={s.photos}>
            {teamContent.profiles.slice(0, joined ? 2 : 1).map(({ id, image }, i) => (
              <figure key={id}>
                <Image src={image} alt='Illustrative portrait' width={240} height={260} />
                <figcaption>{i ? '02 · First teammate' : '01 · Founder'}</figcaption>
              </figure>
            ))}
          </div>
          <small>Illustrative founder story · sample portraits</small>
          <button onClick={onJoin}>{joined ? 'Return to founder' : 'Add first teammate'} →</button>
        </div>
      )}
      {index === 3 && (
        <video
          className={s.proof}
          controls
          playsInline
          preload='none'
          onPlay={pause}
          poster={product.cover.poster}
          src={product.cover.sources[0].src}
        />
      )}
      {index === 4 && (
        <a className={s.artifact} href={proof.href}>
          <Image src={proof.media.poster} width={480} height={300} alt='Shifa Foundation USA project' />
          <b>5× monthly online donation volume ↗</b>
        </a>
      )}
      {index === 5 && (
        <div className={s.network}>
          {product.brief.solution.slice(0, 3).map(({ title }) => (
            <a href={product.href} key={title}>
              {title} ↗
            </a>
          ))}
        </div>
      )}
      {index === 6 && (
        <div className={s.world}>
          {work.slice(0, 3).map(({ slug, title, href }) => (
            <a href={href} key={slug}>
              <i />
              {title}
            </a>
          ))}
        </div>
      )}
      {index === 7 && (
        <div className={s.invite}>
          <i>Your idea goes here.</i>
          <a href='#atlas'>See our work ↗</a>
          <a href='#contact'>Let’s talk ↗</a>
        </div>
      )}
    </div>
  );
}
