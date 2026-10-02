import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const actionClass = (accent) => cn(buttonVariants({ variant: accent ? 'volt' : 'line', size: 'pill' }));

export default function Actions({ items, link: Anchor = Link, meta = () => null, className }) {
  const actionEls = items.map((item) => (
    <Anchor key={item.label} href={item.href} {...meta(item)} className={actionClass(item.accent)}>
      {item.label}
    </Anchor>
  ));
  return <div className={cn('flex flex-wrap gap-3', className)}>{actionEls}</div>;
}
