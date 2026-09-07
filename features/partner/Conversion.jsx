import TrackedLink from './Track';
import { Eyebrow, Section } from '@/components';
import { ReferralForm } from '@/lib/ui/reusable_components';
import { partnerConversion } from '@/lib/content';
import { PARTNER, PARTNER_EVENTS, SITE } from '@/constants';

const STEP_INDEX = 'flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-line font-mono text-[11px]';

export default function Conversion() {
  const { eyebrow, heading, body, expectations, direct } = partnerConversion;
  const bodyEls = body.map((line) => (
    <span key={line} className='block'>
      {line}
    </span>
  ));
  const expectationEls = expectations.map(({ title, detail }, index) => (
    <li key={title} className='flex gap-4'>
      <span aria-hidden='true' className={STEP_INDEX}>
        {index + 1}
      </span>
      <span className='flex flex-col gap-1'>
        <span className='text-base leading-tight text-foreground'>{title}</span>
        <span className='text-sm leading-[1.5] text-mut'>{detail}</span>
      </span>
    </li>
  ));
  return (
    <Section id={PARTNER.formId} variant='paper'>
      <span id={PARTNER.hashes.partner} aria-hidden='true' className='block scroll-mt-[var(--nav-rail)]' />
      <span id={PARTNER.hashes.lead} aria-hidden='true' className='block scroll-mt-[var(--nav-rail)]' />
      <div className='mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-2 lg:items-start lg:gap-16 [&>*]:min-w-0'>
        <div className='flex flex-col gap-8 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
          <header className='flex flex-col gap-4'>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className='max-w-[15ch] font-display text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.02] tracking-[-0.01em]'>{heading}</h2>
            <p className='max-w-[46ch] text-base leading-[1.6] text-mut'>{bodyEls}</p>
          </header>
          <ol className='flex flex-col gap-5 border-t-[1.5px] border-line pt-8'>{expectationEls}</ol>
          <div className='flex flex-col gap-1.5'>
            <span className='font-mono text-[11px] uppercase tracking-[0.14em] text-mut'>{direct.label}</span>
            <TrackedLink
              href={`mailto:${SITE.email}`}
              location='form_direct_email'
              event={PARTNER_EVENTS.directEmail}
              className='w-fit font-display text-2xl leading-none underline decoration-volt decoration-[3px] underline-offset-[7px] transition-[text-decoration-color] duration-200 hover:decoration-ink'
            >
              {SITE.email}
            </TrackedLink>
          </div>
        </div>
        <ReferralForm />
      </div>
    </Section>
  );
}
