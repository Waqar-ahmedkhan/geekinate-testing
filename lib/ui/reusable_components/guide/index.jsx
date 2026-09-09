'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Chat from './Chat';
import { actionsOf, readGuide, textOf } from './stream';
import BrandMark from '../BrandMark';
import { Button } from '@/components/ui/button';
import { runPageActions } from '@/lib/ai/bus';
import { cn } from '@/lib/utils';
import { guideContent } from '@/lib/content';
import { GUIDE, SERVICE_SECTIONS } from '@/constants';

const DOCK = 'flex h-[min(30rem,70svh)] flex-col gap-4 rounded-lg border-[1.5px] border-line bg-glass p-5 shadow-brutal md:p-6';
const HEAD = 'flex items-center gap-3 border-b-[1.5px] border-line pb-4';
const NAME = 'text-base leading-tight tracking-[-0.01em] text-paper';
const STATUS = 'font-mono text-[11px] uppercase tracking-[0.14em] text-mut';
const FLOAT = 'fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 lg:right-8 lg:bottom-8';
const SHEET =
  'flex h-[min(32rem,70svh)] w-[min(23rem,calc(100vw-2.5rem))] origin-bottom-right flex-col gap-4 rounded-lg border-[1.5px] border-line bg-void p-5 shadow-brutal';
const LAUNCH =
  'size-14 cursor-pointer rounded-full border-[1.5px] border-ink bg-volt p-0 text-ink shadow-brutal transition-transform duration-200 ease-out hover:bg-volt motion-reduce:transition-none';

const idFor = () => Math.random().toString(36).slice(2, 10);
const asked = (list) => list.filter((entry) => entry.role === 'user').length;

export default function Guide() {
  const { greeting, errors, capped, failure, unavailable } = guideContent;
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [floating, setFloating] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);
  const ran = useRef(new Set());
  const spent = asked(messages) >= GUIDE.turns;

  useEffect(() => {
    const id = idFor();
    const words = greeting.split(' ');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = reduced ? words.length : 1;
    let at = 0;
    const timer = window.setInterval(
      () => {
        at = Math.min(at + step, words.length);
        setMessages([{ id, role: 'assistant', text: words.slice(0, at).join(' ') }]);
        if (at >= words.length) window.clearInterval(timer);
      },
      reduced ? 0 : GUIDE.greetingWordMs
    );
    return () => window.clearInterval(timer);
  }, [greeting]);

  useEffect(() => {
    const hero = document.getElementById(SERVICE_SECTIONS.hero);
    if (!hero) return undefined;
    const watcher = new IntersectionObserver(([entry]) => setFloating(!entry.isIntersecting), { threshold: 0 });
    watcher.observe(hero);
    return () => watcher.disconnect();
  }, []);

  const perform = useCallback((message) => {
    const fresh = actionsOf(message).filter(({ id }) => !ran.current.has(id));
    if (!fresh.length) return;
    fresh.forEach(({ id }) => ran.current.add(id));
    runPageActions(fresh.map(({ action }) => action));
  }, []);

  const ask = async (text) => {
    const question = text.trim().slice(0, GUIDE.limits.message);
    if (!question || pending) {
      if (!question) setNotice({ title: errors.message, body: '' });
      return;
    }
    const history = [...messages, { id: idFor(), role: 'user', text: question }];
    setMessages(history);
    setDraft('');
    setNotice(null);
    setPending(true);
    try {
      const response = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ id, role, text: said }) => ({ id, role, parts: [{ type: 'text', text: said }] })),
        }),
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        const reason = body?.error;
        setNotice(reason === 'capped' || reason === 'throttled' ? capped : reason === 'not-configured' ? unavailable : failure);
        setPending(false);
        return;
      }
      const replyId = idFor();
      for await (const message of readGuide(response.body)) {
        perform(message);
        const said = textOf(message);
        if (said) setMessages([...history, { id: replyId, role: 'assistant', text: said }]);
      }
      setPending(false);
    } catch {
      setNotice(failure);
      setPending(false);
    }
  };

  const send = (event) => {
    event.preventDefault();
    ask(draft);
  };
  const chat = (fieldId, autoFocus) => (
    <Chat
      messages={messages}
      draft={draft}
      onDraft={setDraft}
      onSend={send}
      onStarter={ask}
      pending={pending}
      spent={spent}
      notice={notice}
      autoFocus={autoFocus}
      fieldId={fieldId}
    />
  );
  const header = (
    <div className={HEAD}>
      <BrandMark size={34} />
      <span className='flex flex-col'>
        <span className={NAME}>{guideContent.title}</span>
        <span className={STATUS}>{guideContent.status}</span>
      </span>
    </div>
  );

  return (
    <>
      <div className={DOCK} aria-hidden={floating}>
        {header}
        {chat('guide-hero', false)}
      </div>
      {floating ? (
        <div className={FLOAT}>
          {open ? (
            <div className={SHEET} role='dialog' aria-label={guideContent.title}>
              {header}
              {chat('guide-float', true)}
            </div>
          ) : null}
          <Button
            type='button'
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? guideContent.close : guideContent.open}
            className={cn(LAUNCH, open && 'rotate-90')}
          >
            {open ? <X aria-hidden='true' className='size-6' /> : <BrandMark size={34} bare className='text-ink' />}
          </Button>
        </div>
      ) : null}
    </>
  );
}
