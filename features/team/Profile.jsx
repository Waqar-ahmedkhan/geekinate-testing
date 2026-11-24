'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import useHoverVideo from '@/lib/ui/reusable_components/useHoverVideo';
import { teamContent } from '@/lib/content/team';
import styles from './styles.module.css';

export default function Profile({ profile, index }) {
  const { name, role, bio, image, clip } = profile;
  const { portraitAlt, profileLabel } = teamContent;
  const { videoRef, hoverHandlers } = useHoverVideo({ line: 0.7 });

  return (
    <article {...hoverHandlers} onFocus={hoverHandlers.onMouseEnter} onBlur={hoverHandlers.onMouseLeave} className={styles.card}>
      <div className={styles.portrait}>
        <Image
          src={image}
          alt={portraitAlt}
          width={640}
          height={800}
          sizes='(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw'
          preload={index === 0}
          className={styles.image}
        />
        <video
          ref={videoRef}
          src={clip}
          muted
          playsInline
          loop
          preload='none'
          aria-hidden='true'
          className={styles.video}
          onPlaying={(event) => {
            event.currentTarget.dataset.playing = 'true';
          }}
          onPause={(event) => {
            delete event.currentTarget.dataset.playing;
          }}
        />
        <details className={styles.profile}>
          <summary className={styles.toggle} aria-label={`${profileLabel}: ${name}`}>
            <Plus size={22} strokeWidth={1.5} aria-hidden='true' />
          </summary>
          <div className={styles.bio}>
            <p>{bio}</p>
          </div>
        </details>
      </div>
      <div className={styles.caption}>
        <h2>{name}</h2>
        <p>{role}</p>
      </div>
    </article>
  );
}
