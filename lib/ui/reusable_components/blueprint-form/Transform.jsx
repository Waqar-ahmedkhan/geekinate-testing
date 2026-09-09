'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, Eyebrow, StepIndex } from '@/components';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { blueprintForm } from '@/lib/content';
import { BLUEPRINT_TRANSFORM } from '@/constants';

const RAIL = 'relative h-[1.5px] w-full bg-line';
const FILL = 'absolute inset-y-0 left-0 bg-volt transition-[width] duration-300 ease-brutal motion-reduce:transition-none';
const RANGE =
  'absolute inset-x-0 -top-4 h-9 w-full cursor-grab appearance-none bg-transparent active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-volt [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-volt [&::-webkit-slider-thumb]:shadow-[2px_2px_0_var(--ink)]';
const PING = 'pointer-events-none absolute -top-3 left-0 flex size-7 -translate-x-1/2 items-center justify-center motion-reduce:hidden';
const ROW = 'grid grid-cols-[auto_1fr] gap-4 border-t-[1.5px] border-line py-4 first:border-t-0';
const SWAP = 'transition-[opacity,transform,color] duration-300 ease-brutal motion-reduce:transition-none';
const QUIET = 'border-line bg-transparent text-mut shadow-none';
const SIDE = 'font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 motion-reduce:transition-none';

export default function Transform({ blueprint }) {
  const { transform } = blueprintForm.result;
  const pairs = blueprint.today.map((step, index) => ({ manual: step, auto: blueprint.automated[index] })).filter(({ auto }) => auto);
  const total = pairs.length;
  const [done, setDone] = useState(0);
  const [touched, setTouched] = useState(false);
  const [running, setRunning] = useState(false);
  const timer = useRef(0);

  useEffect(
    () => () => {
      window.clearInterval(timer.current);
      timer.current = 0;
    },
    []
  );

  const scrub = (next) => {
    window.clearInterval(timer.current);
    timer.current = 0;
    setRunning(false);
    setTouched(true);
    setDone(next);
  };
  const walk = () => {
    setTouched(true);
    if (done === total) {
      setDone(0);
      return;
    }
    setRunning(true);
    timer.current = window.setInterval(() => {
      setDone((current) => {
        if (current + 1 >= total) {
          window.clearInterval(timer.current);
          timer.current = 0;
          setRunning(false);
          return total;
        }
        return current + 1;
      });
    }, BLUEPRINT_TRANSFORM.stepMs);
  };

  const rowEls = pairs.map(({ manual, auto }, index) => {
    const flipped = index < done;
    const shown = flipped ? auto : manual;
    const note = flipped ? auto.handledBy : manual.friction;
    return (
      <li key={manual.step} className={ROW}>
        <StepIndex value={index + 1} className={cn('transition-colors duration-300 motion-reduce:transition-none', !flipped && QUIET)} />
        <span className='flex flex-col gap-1'>
          <span className={cn(SWAP, 'text-base leading-[1.4]', flipped ? 'text-foreground' : 'text-mut line-through decoration-line')}>
            {shown.step}
          </span>
          <span className={cn(SWAP, 'text-sm leading-[1.5]', flipped ? 'text-volt' : 'text-mut')}>{note}</span>
        </span>
      </li>
    );
  });

  return (
    <Card onPaper className='gap-6'>
      <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
        <span className={cn(SIDE, done < total ? 'text-paper' : 'text-mut')}>{transform.today}</span>
        <Eyebrow className='order-last w-full sm:order-none sm:w-auto'>{`${done} / ${total} ${transform.countLabel}`}</Eyebrow>
        <span className={cn(SIDE, done === total ? 'text-volt' : 'text-mut')}>{transform.automated}</span>
      </div>
      <div className='relative pt-2 pb-2'>
        <div className={RAIL}>
          <span className={FILL} style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
        {touched ? null : (
          <span aria-hidden='true' className={PING}>
            <span className='absolute inline-flex size-7 animate-ping rounded-full bg-volt opacity-60' />
          </span>
        )}
        <input
          type='range'
          min={0}
          max={total}
          step={1}
          value={done}
          onChange={(event) => scrub(Number(event.target.value))}
          aria-label={transform.label}
          aria-valuetext={`${done} of ${total} ${transform.countLabel}`}
          className={RANGE}
        />
      </div>
      <p
        className={cn(
          'text-sm leading-[1.5] transition-colors duration-300 motion-reduce:transition-none',
          touched ? 'text-mut' : 'text-volt'
        )}
      >
        {done === total ? transform.doneHint : transform.label}
      </p>
      <ol className='flex flex-col'>{rowEls}</ol>
      <Button
        type='button'
        onClick={walk}
        disabled={running}
        className='h-11 w-fit cursor-pointer rounded-full border-[1.5px] border-ink bg-volt px-6 text-ink shadow-brutal-sm hover:bg-volt disabled:opacity-60'
      >
        {done === total ? transform.reset : running ? transform.running : transform.run}
      </Button>
    </Card>
  );
}
