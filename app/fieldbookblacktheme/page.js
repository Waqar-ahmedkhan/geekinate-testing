import Image from 'next/image';
import Link from 'next/link';
import Cta from '@/features/cta';
import Player from '@/features/ride-story/Player';
import ScrollReveal from '@/features/ride-story/ScrollReveal';
import { milestones, people } from '@/lib/content/ride-story/story-data';
import { achievements, milestonePolaroids, trajectory } from '@/lib/content/ride-story/story-copy';
import r from '@/features/ride-story/story.module.css';
import d from '@/features/ride-story/story-dark.module.css';

export const metadata = {
  title: 'The Living Fieldbook · Geekinate',
  robots: { index: false, follow: true },
};

export default function FieldbookBlackTheme() {
  const crewList = Object.entries(people);

  return (
    <main className={`${r.fieldbookPage} ${d.darkPage}`}>
      <ScrollReveal />

      <Player theme='dark' />

      <section className={`${d.darkSection} ${r.teamSection}`} id='team' aria-labelledby='crew-heading'>
        <div className={r.sectionHead} data-reveal='heading'>
          <div className={r.headingRow}>
            <h2 id='crew-heading'>The team</h2>
          </div>
          <p className={`${r.credit} ${d.credit}`}>The crew behind Geekinate’s design, engineering, games, and growth.</p>
        </div>

        <ol className={r.crew}>
          {crewList.map(([id, person]) => {
            const event = milestones.find((item) => item.id === person.entry);
            return (
              <li key={id} id={'person-' + id} className={r.crewItem} data-reveal='polaroid'>
                <a href={'#entry-' + event.id} className={`${r.polaroidLink} ${d.polaroidLink}`}>
                  <figure className={`${r.polaroidFrame} ${d.polaroidFrame}`}>
                    <div className={r.polaroidMedia}>
                      <Image
                        src={person.portrait}
                        width={420}
                        height={525}
                        alt={`${person.name} — ${person.role}`}
                        className={`${r.polaroidImg} ${d.polaroidImg}`}
                      />
                    </div>
                    <figcaption className={`${r.polaroidYear} ${d.polaroidYear}`}>{event.year}</figcaption>
                  </figure>
                  <div className={`${r.crewMeta} ${d.crewMeta}`}>
                    <h3>{person.name}</h3>
                    <small>{person.role}</small>
                    <p>{person.bio}</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`${d.darkSection} ${r.achievementsSection}`} id='achievements' aria-labelledby='achievements-heading'>
        <div className={r.sectionHead} data-reveal='heading'>
          <div className={r.headingRow}>
            <h2 id='achievements-heading'>Achievements</h2>
          </div>
          <p className={`${r.credit} ${d.credit}`}>Real numbers and real habits from the projects we’ve shipped together.</p>
        </div>

        <div className={r.achievementsGrid}>
          {achievements.map((item) => (
            <article key={item.label} className={`${r.statCard} ${d.statCard}`} data-reveal='stat'>
              <span className={`${r.statNumber} ${d.statNumber}`} data-count-to={item.value} data-count-suffix={item.suffix}>
                {item.value}
                {item.suffix}
              </span>
              <h3>{item.label}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${d.darkSection} ${r.logbookSection}`} id='logbook' aria-labelledby='logbook-heading'>
        <div className={r.logbookHead} data-reveal='heading'>
          <h2 id='logbook-heading'>{trajectory.title}</h2>
          <p className={`${r.trajectoryIntro} ${d.trajectoryIntro}`}>{trajectory.intro}</p>
        </div>

        <ol className={`${r.ledger} ${d.ledger}`}>
          <li className={r.timelineRail} aria-hidden='true'>
            <span className={`${r.spineProgress} ${d.spineProgress}`} data-spine-fill />
          </li>
          {milestones.map((event, idx) => {
            const isRight = idx % 2 === 1;
            const polaroid = milestonePolaroids[event.id];
            const isFinal = idx === milestones.length - 1;

            return (
              <li
                key={event.id}
                id={'entry-' + event.id}
                className={`${r.ledgerItem} ${isFinal ? `${r.ledgerFinal} ${d.ledgerFinal}` : ''}`}
                data-reveal={isRight ? 'right' : 'left'}
              >
                <span className={`${r.spineNode} ${d.spineNode}`} data-spine-node aria-hidden='true' />
                <div className={`${r.ledgerCard} ${d.ledgerCard}`} data-ledger-card>
                  <time className={`${r.dateBadge} ${d.dateBadge}`}>
                    {event.year} · {event.month}
                  </time>
                  <h3>{event.title}</h3>
                  <p className={`${r.ledgerAction} ${d.ledgerAction}`}>{event.action}</p>
                  <div className={`${r.growthOutcome} ${d.growthOutcome}`}>
                    <span>{trajectory.changeLabel}</span>
                    <p>{event.consequence}</p>
                  </div>

                  {event.metrics.length > 0 && (
                    <div className={r.metrics}>
                      {event.metrics.map((metric) => (
                        <span className={`${r.tag} ${d.tag}`} key={metric.unit}>
                          {metric.qualifier ? `${metric.qualifier} ` : ''}
                          {metric.unit.startsWith('x ')
                            ? `${metric.value}× ${metric.unit.slice(2)}`
                            : `${metric.value.toLocaleString('en-US')} ${metric.unit}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {polaroid && polaroid.kind === 'crew' ? (
                    <figure className={`${r.inlinePolaroid} ${d.inlinePolaroid}`} data-parallax-polaroid>
                      <div className={`${r.crewMiniStrip} ${d.crewMiniStrip}`}>
                        {crewList.map(([pid, p]) => (
                          <div key={pid} className={`${r.crewMiniCell} ${d.crewMiniCell}`}>
                            <Image src={p.portrait} width={160} height={200} alt={p.name} />
                          </div>
                        ))}
                      </div>
                      <figcaption>{polaroid.caption}</figcaption>
                    </figure>
                  ) : polaroid ? (
                    <figure className={`${r.inlinePolaroid} ${d.inlinePolaroid}`} data-parallax-polaroid>
                      <div className={`${r.inlinePhotoWrap} ${d.inlinePhotoWrap}`}>
                        <Image src={polaroid.src} width={480} height={320} alt={polaroid.caption} className={r.inlinePhoto} />
                      </div>
                      <figcaption>{polaroid.caption}</figcaption>
                    </figure>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={`${r.inviteWrap} ${d.inviteWrap}`} id='your-turn' aria-labelledby='invite-heading'>
        <aside className={`${r.inviteSheet} ${d.inviteSheet}`} data-reveal='sheet'>
          <span className={`${r.inviteTapeLeft} ${d.inviteTapeLeft}`} aria-hidden='true' />
          <span className={`${r.inviteTapeRight} ${d.inviteTapeRight}`} aria-hidden='true' />
          <span className={`${r.continuedPill} ${d.continuedPill}`}>TO BE CONTINUED</span>
          <h2 id='invite-heading'>Now it’s your turn.</h2>
          <p className={`${r.inviteCopy} ${d.inviteCopy}`}>
            Bring us your product, game, or campaign — let’s write the next chapter together.
          </p>

          <div className={`${r.yourPhotoFrame} ${d.yourPhotoFrame}`} data-reveal='your-photo' aria-hidden='true'>
            <span className={`${r.thumbtack} ${d.thumbtack}`} />
            <div className={`${r.yourPhotoInner} ${d.yourPhotoInner}`}>
              <span>YOUR PROJECT</span>
              <small>NEXT IN THE LOGBOOK</small>
            </div>
          </div>

          <div className={r.inviteActions}>
            <Link href='/#contact' className={`${r.ctaPrimary} ${d.ctaPrimary}`}>
              Let’s talk
            </Link>
            <Link href='/#work' className={`${r.ctaSecondary} ${d.ctaSecondary}`}>
              See our work
            </Link>
          </div>

          <p className={`${r.inviteFoot} ${d.inviteFoot}`}>
            Something on your mind? <Link href='/#contact'>Get in touch</Link>
          </p>
        </aside>
      </section>

      <Cta />
    </main>
  );
}
