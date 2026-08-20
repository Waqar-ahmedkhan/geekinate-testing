import Link from 'next/link';
import { BrandMark, SocialIcon } from '@/lib/ui/reusable_components';
import { footerColumns, footerContent } from '@/lib/content';
import { SITE, SOCIALS } from '@/constants';

// Transcribed from wearestokt.com, measured live at 1920: a black card inset 16px on every side, 12px radius, 24px of inner
// padding, standing exactly one viewport tall so it arrives as its own screen. A full-bleed render fills it and the text sits
// straight on the footage — no scrim, matching the reference.
//
// The 12px radius is the reference's, not the brand's 20px, for the same reason the work grid runs at 10px: these two blocks are
// measured reconstructions. Everything else is on brand tokens — --footer-mut was reserved for exactly this surface.
//
// The inset is the one thing here that has been argued: it was stripped on 2026-08-07 as container design, then restored once the
// testimonials row landed above it and the frame read as intentional rather than stray. It is the reference's geometry either way.
//
// The navbar clears this panel rather than the other way round — `Nav` watches for this `<footer>` element and retreats once it
// reaches the rail. See the note there. `z-50` matches Nav's own so nothing shows through during the 420ms retreat; the reference
// pairs its footer and navbar on the same z-index for the same reason.
const MUTED = 'text-[1.225rem] leading-[1.1] tracking-[-0.02em] text-footer-mut transition-colors duration-200 hover:text-paper';

const FooterLink = ({ label, href, external }) => {
  if (!href) return <span className={MUTED}>{label}</span>;
  if (external)
    return (
      <a href={href} target='_blank' rel='noreferrer' className={MUTED}>
        {label} <span aria-hidden='true'>↗</span>
      </a>
    );
  return (
    <Link href={href} className={MUTED}>
      {label}
    </Link>
  );
};

// The socials left the link grid on 2026-08-20 and became this row along the foot of the panel. Icon and label rather than icon
// alone: the mark carries it for anyone who recognises it and `aria-label` carries it for a screen reader, but a bare glyph in a
// footer is a guess for everyone in between, and these three are small enough that naming them costs one line of the row.
const SocialLink = ({ label, icon, href }) => (
  <a
    href={href}
    target='_blank'
    rel='noreferrer'
    className='flex items-center gap-2 text-footer-mut transition-colors duration-200 hover:text-paper'
  >
    <SocialIcon name={icon || label} className='size-[18px]' />
    <span className='text-sm leading-[1.1] tracking-[-0.02em]'>{label}</span>
  </a>
);

// The heading is set at twice the links rather than a step above them, so the two columns read as two labelled blocks from across
// the panel instead of as one list with a slightly bolder first line. The 36px under it is what earns that: the heading has to sit
// clear of its own list, or a 2rem line directly over a 1.225rem one reads as the first item rather than as the label.
//
// That gap belongs to the heading, not to the list. The links keep a rhythm of their own, opened from 6/10px on 2026-08-20 because
// the type under these headings is 1.225rem now and a 10px gap under a 21px line is tighter than the leading inside it — the column
// read as one block of text rather than as a set of separate destinations. Still well under the heading's, so the grouping holds.
const FooterColumn = ({ title, links }) => (
  <div className='flex flex-col gap-9'>
    <p className='text-[2rem] leading-[1.1] text-paper'>{title}</p>
    <div className='flex flex-col items-start gap-3 md:gap-4'>
      {links.map((link) => (
        <FooterLink key={link.label} {...link} />
      ))}
    </div>
  </div>
);

export default function Footer() {
  const { rights } = footerContent;
  const copyright = `© ${new Date().getFullYear()} ${SITE.name}.`;
  return (
    // Deliberately not carrying `on-paper` with the paper sections above it. It went light on 2026-08-13 and came straight back:
    // this panel is the last screen of the site and the one the whole scroll builds toward, and it wants to land dark.
    <footer className='relative z-50 p-4'>
      {/* The footer is where the particle cloud finishes reforming as the mark, so this panel cannot be opaque and cannot blur: a
          backdrop-filter here would soften the one frame of the page the whole scroll has been building toward. It is a plain
          translucent tint behind a 1.5px rule, and the content is held to the left of the panel to leave the letterform the right of
          it. The full-bleed video that used to fill it was removed on 2026-08-11 for the same reason. */}
      {/* The bottom padding clears the mobile menu bar, which is fixed 16px off the bottom of the viewport and 45px tall. This is
          the last content on the page, so without it the copyright line sits permanently underneath the bar with no scroll left to
          free it. The bar is `lg:hidden`, so the padding goes back to the panel's own at `lg`. */}
      <div className='border-brutal relative flex min-h-[calc(100svh-2rem)] flex-col justify-between overflow-hidden rounded-[12px] bg-void/30 p-6 pb-24 lg:pb-6'>
        {/* The panel is two halves from `lg`: every piece of content in the left one, the letterform alone in the middle of the
            right — see the anchor in MorphCloud. Below `lg` the cap comes off, because the mark's own offset falls away as the frame
            narrows and it drifts back toward the centre, where a left column would only crowd it.
            `flex-1` is what makes this a half rather than a block sitting in the corner of one: it claims the height the panel is
            not giving the copyright line, so the content inside can be spread down it instead of stacking at the top and leaving the
            bottom two thirds of the half empty. */}
        <div className='relative flex flex-1 flex-col gap-8 lg:w-1/2'>
          <div className='flex flex-col items-start gap-2.5'>
            {/* Set to the column headings' own 2rem rather than a size of its own. This is the first thing in the half and the two
                headings are the next, so a wordmark below them reads as a caption on the panel rather than as the name on it. The
                mark keeps its ratio to the type it sits in — 34 against 28px before, so 39 against 32. */}
            <Link
              href='/'
              aria-label={`${SITE.name} home`}
              className='flex items-center gap-2 font-logo text-[2rem] leading-none text-paper'
            >
              <BrandMark size={39} className='shrink-0' />
              {SITE.name}
            </Link>
            <a href={`mailto:${SITE.email}`} className={MUTED}>
              {SITE.email}
            </a>
          </div>
          {/* Two columns, because there are two lists left — see the note on `footerColumns`. `w-fit` keeps them at the width their
              longest link needs rather than stretching them across the half, and the 120px column gap is what separates them
              instead: a column stretched to fill leaves a line of type with a hundred pixels of nothing after it, which reads as
              broken, where a wide gutter between narrow columns reads as deliberate.
              `my-auto` centres the row in whatever height is left under the brand block, which is what spreads the half rather than
              stacking it — see the note on `flex-1` above. */}
          <div className='grid grid-cols-2 gap-x-8 gap-y-6 md:my-auto md:w-fit md:gap-x-30 md:gap-y-12'>
            {footerColumns.map(({ title, links }) => (
              <FooterColumn key={title} title={title} links={links} />
            ))}
          </div>
        </div>
        {/* The foot of the panel runs the full width rather than staying inside the left half, and it is the one row that does. The
            copyright sits on the panel's right rail, under the mark, so the two halves are closed off by something at the bottom of
            each instead of the right half trailing away into nothing below the letterform. */}
        <div className='relative mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <nav aria-label='Geekinate on social platforms' className='flex flex-wrap items-center gap-x-6 gap-y-2'>
            {SOCIALS.map((social) => (
              <SocialLink key={social.label} {...social} />
            ))}
          </nav>
          {/* Muted, not paper. This line is the quietest thing in the panel and it was the brightest — white type at the foot of a
              black card pulls the eye down to a copyright notice, past everything the footer is actually for. On the nav links'
              own colour it sits at the same level as the rest of the small type. */}
          <div className='flex flex-wrap gap-x-8 gap-y-1 text-lg leading-[1.1] text-footer-mut md:justify-end md:text-right'>
            <span>{copyright}</span>
            <span>{rights}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
