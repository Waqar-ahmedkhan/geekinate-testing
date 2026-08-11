import Link from 'next/link';
import { BrandMark } from '@/lib/ui/reusable_components';
import { footerColumns, footerContent } from '@/lib/content';
import { SITE } from '@/constants';

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
const MUTED = 'text-base leading-[1.1] tracking-[-0.02em] text-footer-mut transition-colors duration-200 hover:text-paper';

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

const FooterColumn = ({ title, links }) => (
  <div className='flex flex-col gap-4'>
    <p className='text-lg leading-[1.1] text-paper'>{title}</p>
    <div className='flex flex-col items-start gap-2.5'>
      {links.map((link) => (
        <FooterLink key={link.label} {...link} />
      ))}
    </div>
  </div>
);

export default function Footer() {
  const { location, rights } = footerContent;
  const copyright = `© ${new Date().getFullYear()} ${SITE.name}.`;
  return (
    <footer className='relative z-50 p-4'>
      {/* The footer is where the particle cloud finishes reforming as the mark, so this panel cannot be opaque and cannot blur: a
          backdrop-filter here would soften the one frame of the page the whole scroll has been building toward. It is a plain
          translucent tint behind a 1.5px rule, and the content is pushed to the top and bottom rails to leave the letterform the
          middle of the viewport. The full-bleed video that used to fill it was removed on 2026-08-11 for the same reason. */}
      <div className='border-brutal relative flex min-h-[calc(100svh-2rem)] flex-col justify-between overflow-hidden rounded-[12px] bg-void/30 p-6'>
        <div className='relative flex flex-col gap-12 md:flex-row md:items-start md:justify-between md:gap-8'>
          <div className='flex flex-col items-start gap-2.5 md:w-auto md:shrink-0'>
            <Link
              href='/'
              aria-label={`${SITE.name} home`}
              className='flex items-center gap-2 font-logo text-[28px] leading-none text-paper'
            >
              <BrandMark size={34} className='shrink-0' />
              {SITE.name}
            </Link>
            <span className='text-base leading-[1.1] tracking-[-0.02em] text-footer-mut'>{location}</span>
            <a href={`mailto:${SITE.email}`} className={MUTED}>
              {SITE.email}
            </a>
          </div>
          {/* Two by two on desktop, not a single row of four. A four-across row starts at the horizontal centre, which is exactly
              where the particle cloud finishes assembling — the first column landed inside the counter of the G and neither the
              letterform nor the links could be read. Folding to a 2x2 block halves the width and clears the middle. */}
          <div className='grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 md:ml-auto md:w-auto md:grid-cols-2 md:gap-x-14 md:gap-y-12'>
            {footerColumns.map(({ title, links }) => (
              <FooterColumn key={title} title={title} links={links} />
            ))}
          </div>
        </div>
        <div className='relative mt-16 flex flex-wrap gap-x-8 gap-y-1 text-lg leading-[1.1] text-paper'>
          <span>{copyright}</span>
          <span>{rights}</span>
        </div>
      </div>
    </footer>
  );
}
