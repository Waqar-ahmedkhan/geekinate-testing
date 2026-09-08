import Link from 'next/link';
import { cn } from '@/lib/utils';

const ACTION = 'border-brutal rounded-full px-6 py-3 text-sm transition-colors duration-200 ease-brutal';
const ACCENT = 'bg-volt text-ink shadow-brutal-sm hover:bg-volt/85';
const PLAIN = 'text-paper hover:bg-lift';

export default function Actions({ items, link: Anchor = Link, meta = () => null, className }) {
  const actionEls = items.map((item) => (
    <Anchor key={item.label} href={item.href} {...meta(item)} className={cn(ACTION, item.accent ? ACCENT : PLAIN)}>
      {item.label}
    </Anchor>
  ));
  return <div className={cn('flex flex-wrap gap-3', className)}>{actionEls}</div>;
}
