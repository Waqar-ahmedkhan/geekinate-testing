import Cover from './Cover';
import { Section } from '@/components';
import { WORK } from '@/constants';

const SHELL = '-mt-[var(--nav-rail)] px-0 pt-[calc(var(--nav-rail)+3rem)] pb-0 md:px-0 md:pt-[calc(var(--nav-rail)+4rem)] md:pb-0';
const TITLE = 'max-w-[34ch] text-balance font-display text-[clamp(2.25rem,4.4vw,4.25rem)] leading-[1.02] tracking-[-0.01em] text-paper';
const PANEL =
  'on-paper absolute inset-x-0 top-[42%] bottom-0 bg-paper [mask-image:radial-gradient(50%_1.75rem_at_50%_0,transparent_99%,#000_100%)] md:[mask-image:radial-gradient(50%_3.5rem_at_50%_0,transparent_99%,#000_100%)]';
const FRAME =
  'relative mx-auto w-full max-w-[min(72rem,calc(62svh*16/9))] overflow-hidden rounded-lg border-[1.5px] border-ink bg-black shadow-[3px_3px_0_var(--ink)]';

export default function CaseHero({ project }) {
  const { title, media, cover = media } = project;
  const frameStyle = { aspectRatio: cover.ratio ?? WORK.coverRatio };
  return (
    <Section id='hero-work' variant='clear' className={SHELL}>
      <div className='flex justify-center px-6 text-center md:px-10'>
        <h1 className={TITLE}>{title}</h1>
      </div>
      <div className='relative mt-10 md:mt-14'>
        <div aria-hidden='true' className={PANEL} />
        <div className='relative px-6 pb-16 md:px-10 md:pb-24'>
          <div className={FRAME} style={frameStyle}>
            <Cover media={cover} />
          </div>
        </div>
      </div>
    </Section>
  );
}
