import Image from 'next/image';
import { SITE } from '@/constants';
import { Section } from '@/components';
import { teamContent } from '@/lib/content/team';
import { work } from '@/lib/content/work';
import Profile from './Profile';
import styles from './styles.module.css';

export default function Team() {
  const { gridHeading, note, profiles, join, explore } = teamContent;

  return (
    <Section id='team' variant='ink' className={styles.section}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p>{gridHeading}</p>
          <h1>{teamContent.headline}</h1>
        </header>
        <div className={styles.grid}>
          {profiles.map((profile, index) => (
            <Profile key={profile.id} profile={profile} index={index} />
          ))}
          <article className={styles.join}>
            <h2>{join.title}</h2>
            <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(join.subject)}`}>{join.action} ↗</a>
          </article>
        </div>
        <p className={styles.note}>{note}</p>
        <section className={styles.explore}>
          <div className={styles.gallery} aria-hidden='true'>
            {work.slice(0, 5).map(({ slug, media }) => (
              <Image key={slug} src={media.poster} width={400} height={300} alt='' />
            ))}
          </div>
          <div>
            <h2>{explore.title}</h2>
            <div className={styles.links}>
              {explore.tools.map(({ label, url }) => (
                <a href={url + encodeURIComponent(explore.prompt)} key={label} target='_blank' rel='noreferrer'>
                  {label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Section>
  );
}
