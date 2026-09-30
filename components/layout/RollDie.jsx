import { DIE } from '@/constants';

const STAGE = 'relative block size-(--die) shrink-0 perspective-[10rem] [--die:1.75rem]';
const CUBE =
  'relative block size-full transform-3d [transform:translateZ(calc(var(--die)/-2))_rotateX(0deg)_rotateY(0deg)] transition-transform duration-0 group-hover/lift:[transform:translateZ(calc(var(--die)/-2))_rotateX(var(--roll-x))_rotateY(var(--roll-y))] group-hover/lift:duration-[1300ms] group-hover/lift:ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none';
const FACE =
  'absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center rounded-[22%] border-[1.5px] border-ink bg-volt p-[14%] backface-hidden';
const PIP = 'size-[72%] rounded-full bg-ink';

const faceValues = (value) => {
  const [across, over] = DIE.pairs.filter((pair) => !pair.includes(value)).map(([low]) => low);
  return [value, 7 - value, across, 7 - across, over, 7 - over];
};
const pipStyle = (cell) => ({ gridRow: Math.floor(cell / 3) + 1, gridColumn: (cell % 3) + 1 });
const faceStyle = (side) => ({ transform: `${DIE.sides[side]} translateZ(calc(var(--die) / 2))` });
const rollStyle = ([turnsX, turnsY]) => ({ '--roll-x': `${turnsX * 360}deg`, '--roll-y': `${turnsY * 360}deg` });

export default function RollDie({ value }) {
  const faceEls = faceValues(value).map((face, side) => {
    const pipEls = DIE.pips[face].map((cell) => <span key={cell} className={PIP} style={pipStyle(cell)} />);
    return (
      <span key={side} className={FACE} style={faceStyle(side)}>
        {pipEls}
      </span>
    );
  });
  return (
    <span className={STAGE}>
      <span className='sr-only'>{value}</span>
      <span aria-hidden='true' className={CUBE} style={rollStyle(DIE.rolls[value - 1])}>
        {faceEls}
      </span>
    </span>
  );
}
