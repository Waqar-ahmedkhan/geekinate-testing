import { Circle, Diamond, Hexagon, Octagon, Pentagon, Square, Star, Triangle } from 'lucide-react';

const SHAPES = [Hexagon, Circle, Triangle, Diamond, Octagon, Square, Pentagon, Star];

export default function ClientLogo({ name, index }) {
  const Shape = SHAPES[index % SHAPES.length];
  return (
    <span className='flex shrink-0 items-center gap-2.5 text-mut'>
      <Shape aria-hidden='true' strokeWidth={1.25} className='size-5 shrink-0 md:size-6' />
      <span className='font-mono text-sm whitespace-nowrap uppercase tracking-[0.16em] md:text-base'>{name}</span>
    </span>
  );
}
