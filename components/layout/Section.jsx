import { cn } from '@/lib/utils';

const variants = {
  clear: 'text-foreground',
  paper: 'on-paper bg-paper text-ink',
  wash: 'bg-lift text-foreground',
  ink: 'bg-black text-paper',
};

export default function Section({ id, variant = 'clear', className, children }) {
  return (
    <section id={id} className={cn('relative z-10 px-6 py-20 md:px-10 md:py-28', variants[variant], className)}>
      {children}
    </section>
  );
}
