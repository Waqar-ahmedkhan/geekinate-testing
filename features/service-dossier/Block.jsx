import { Eyebrow } from '@/components';

export default function Block({ id, label, heading, children }) {
  return (
    <section id={id} className='scroll-mt-[calc(var(--nav-rail)+2rem)]'>
      <header className='mb-8 flex flex-col gap-3 md:mb-10'>
        <Eyebrow>{label}</Eyebrow>
        <h2 className='font-display text-[clamp(1.875rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em]'>{heading}</h2>
      </header>
      {children}
    </section>
  );
}
