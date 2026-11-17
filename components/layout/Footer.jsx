import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BrandMark, SocialIcon } from '@/lib/ui/reusable_components';
import { footerColumns, footerContent } from '@/lib/content';
import { SITE, SOCIALS } from '@/constants';

const MUTED = 'text-[1.225rem] leading-[1.1] tracking-[-0.02em] text-footer-mut';
const LINK = `${MUTED} -my-1.5 py-1.5 transition-colors duration-200 hover:text-paper`;

const FooterLink = ({ label, href, external }) => {
  if (!href) return <span className={MUTED}>{label}</span>;
  if (external)
    return (
      <a href={href} target='_blank' rel='noreferrer' className={LINK}>
        {label} <span aria-hidden='true'>↗</span>
      </a>
    );
  return (
    <Link href={href} className={LINK}>
      {label}
    </Link>
  );
};

const SocialLink = ({ label, icon, href }) => (
  <a
    href={href}
    target='_blank'
    rel='noreferrer'
    className='-my-2 flex items-center gap-2 py-2 text-footer-mut transition-colors duration-200 hover:text-paper'
  >
    <SocialIcon name={icon || label} className='size-[18px]' />
    <span className='text-sm leading-[1.1] tracking-[-0.02em]'>{label}</span>
  </a>
);

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

const PartnerLead = ({ cta, href }) => (
  <Button asChild variant='volt' size='pill-sm' className='self-start'>
    <Link href={href}>
      {cta} <span aria-hidden='true'>→</span>
    </Link>
  </Button>
);

export default function Footer() {
  const { rights, partner } = footerContent;
  const copyright = `© ${new Date().getFullYear()} ${SITE.name}.`;
  return (
    <footer className='relative z-50 p-4'>
      <div className='border-brutal relative flex min-h-[calc(100svh-2rem)] flex-col justify-between overflow-hidden rounded-[12px] bg-void/20 p-6'>
        <div className='relative flex flex-col gap-8 lg:w-1/2 lg:flex-1'>
          <div className='flex flex-col items-start gap-3'>
            <Link
              href='/'
              aria-label={`${SITE.name} home`}
              className='flex items-center gap-2 font-logo text-[2rem] leading-none text-paper'
            >
              <BrandMark size={39} className='shrink-0' />
              {SITE.name}
            </Link>
          </div>
          <div className='flex flex-col gap-8 lg:my-auto'>
            <PartnerLead {...partner} />
            <div className='grid grid-cols-2 gap-x-8 gap-y-6 border-t border-footer-line pt-8 md:w-fit md:gap-x-30 md:gap-y-12'>
              {footerColumns.map(({ title, links }) => (
                <FooterColumn key={title} title={title} links={links} />
              ))}
            </div>
          </div>
        </div>
        <div data-footer-mark='' aria-hidden='true' className='min-h-64 flex-1 lg:hidden' />
        <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mt-16'>
          <nav aria-label='Geekinate on social platforms' className='flex flex-wrap items-center gap-x-6 gap-y-2'>
            {SOCIALS.map((social) => (
              <SocialLink key={social.label} {...social} />
            ))}
          </nav>
          <div className='flex flex-wrap gap-x-8 gap-y-1 text-lg leading-[1.1] text-footer-mut md:justify-end md:text-right'>
            <span>{copyright}</span>
            <span>{rights}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
