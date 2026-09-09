import { Eyebrow, Section } from '@/components';
import { BlueprintForm } from '@/lib/ui/reusable_components';
import { SERVICE_SECTIONS } from '@/constants';

export default function Blueprint({ content }) {
  const { eyebrow, heading, body } = content;
  return (
    <Section id={SERVICE_SECTIONS.blueprint} variant='paper' className='scroll-mt-[var(--nav-rail)] border-t-[1.5px] border-line'>
      <div className='mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16 [&>*]:min-w-0'>
        <div>
          <header className='flex flex-col gap-4 lg:sticky lg:top-[calc(var(--nav-rail)+2.5rem)]'>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className='max-w-[14ch] font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.01em]'>{heading}</h2>
            <p className='max-w-[46ch] text-base leading-[1.6] text-mut'>{body}</p>
          </header>
        </div>
        <BlueprintForm />
      </div>
    </Section>
  );
}
