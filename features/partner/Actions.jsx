import TrackedLink from './Track';
import { cn } from '@/lib/utils';

const ACTION = 'border-brutal rounded-full px-6 py-3 text-sm transition-colors duration-200 ease-brutal';

export default function Actions({ items, location, className }) {
  const actionEls = items.map(({ label, href, accent, intent }) => (
    <TrackedLink
      key={label}
      href={href}
      location={location}
      label={label}
      intent={intent}
      className={cn(ACTION, accent ? 'bg-volt text-ink shadow-brutal-sm hover:bg-volt/85' : 'text-paper hover:bg-lift')}
    >
      {label}
    </TrackedLink>
  ));
  return <div className={cn('flex flex-wrap gap-3', className)}>{actionEls}</div>;
}
