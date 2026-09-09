'use client';

import { useEffect, useRef } from 'react';
import { LoaderCircle, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { guideContent } from '@/lib/content';
import { GUIDE } from '@/constants';

const LOG =
  'flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5';
const SAID = 'max-w-[88%] rounded-lg border-[1.5px] px-4 py-3 text-base leading-[1.55]';
const FROM_GUIDE = 'mr-auto rounded-bl-sm border-line bg-lift text-paper';
const FROM_YOU = 'ml-auto rounded-br-sm border-ink bg-volt text-ink shadow-brutal-sm';
const WHO = 'font-mono text-[11px] uppercase tracking-[0.14em] text-mut';
const FIELD =
  'h-12 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-void px-4 text-base text-paper shadow-none placeholder:text-mut md:text-base';
const STARTER =
  'min-h-11 cursor-pointer rounded-full border-[1.5px] border-line bg-transparent px-4 py-2 text-left text-sm leading-[1.45] text-paper transition-colors duration-200 ease-brutal hover:bg-lift disabled:cursor-default';
const DOT = 'size-1.5 rounded-full bg-mut motion-safe:animate-pulse';

export default function Chat({ messages, draft, onDraft, onSend, onStarter, pending, spent, notice, autoFocus, fieldId, greeted }) {
  const { starters, capped } = guideContent;
  const quiet = greeted && messages.length < 2 && !pending && !spent;
  const logRef = useRef(null);
  const fieldRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, pending]);

  useEffect(() => {
    if (autoFocus) fieldRef.current?.focus();
  }, [autoFocus]);

  const saidEls = messages.map(({ id, role, text }) => (
    <div key={id} className='flex flex-col gap-1'>
      <span className={cn(WHO, role === 'user' && 'text-right')}>{role === 'user' ? guideContent.you : guideContent.studio}</span>
      <p className={cn(SAID, role === 'user' ? FROM_YOU : FROM_GUIDE)}>{text}</p>
    </div>
  ));
  const starterEls = starters.map((sentence, index) => (
    <button
      key={sentence}
      type='button'
      onClick={() => onStarter(sentence)}
      disabled={pending || spent}
      style={{ animationDelay: `${index * GUIDE.starterStepMs}ms` }}
      className={cn(
        STARTER,
        'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:fill-mode-backwards'
      )}
    >
      {sentence}
    </button>
  ));

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <div ref={logRef} data-lenis-prevent className={LOG} role='log' aria-live='polite' aria-label={guideContent.title}>
        {saidEls}
        {pending ? (
          <span className={cn(SAID, FROM_GUIDE, 'flex w-fit items-center gap-1.5')} aria-label={guideContent.thinking}>
            <span className={DOT} />
            <span className={cn(DOT, 'motion-safe:[animation-delay:150ms]')} />
            <span className={cn(DOT, 'motion-safe:[animation-delay:300ms]')} />
          </span>
        ) : null}
        {quiet ? (
          <div className='mt-1 flex flex-col gap-2'>
            <span className={WHO}>{guideContent.starterLabel}</span>
            {starterEls}
          </div>
        ) : null}
      </div>
      {notice ? (
        <p role='status' className='text-sm leading-[1.5] text-mut'>
          <strong className='font-medium text-paper'>{notice.title}</strong> {notice.body}
        </p>
      ) : null}
      {spent ? (
        <p className='text-sm leading-[1.5] text-mut'>{capped.body}</p>
      ) : (
        <form onSubmit={onSend} noValidate className='flex items-center gap-2' aria-busy={pending}>
          <label htmlFor={fieldId} className='sr-only'>
            {guideContent.label}
          </label>
          <Input
            ref={fieldRef}
            id={fieldId}
            name='guide'
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            disabled={pending}
            maxLength={GUIDE.limits.message}
            placeholder={guideContent.placeholder}
            className={FIELD}
          />
          <Button
            type='submit'
            disabled={pending}
            aria-label={guideContent.send}
            className='size-12 shrink-0 cursor-pointer rounded-full border-[1.5px] border-ink bg-volt text-ink shadow-brutal-sm hover:bg-volt'
          >
            {pending ? (
              <LoaderCircle aria-hidden='true' className='size-4 animate-spin' />
            ) : (
              <SendHorizontal aria-hidden='true' className='size-4' />
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
