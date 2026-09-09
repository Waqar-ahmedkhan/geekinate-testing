'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import AgentMark from './AgentMark';
import Chat from './Chat';
import { actionsOf, readGuide, textOf } from './stream';
import BrandMark from '../BrandMark';
import { Button } from '@/components/ui/button';
import { runPageActions } from '@/lib/ai/bus';
import { watchGate } from '@/lib/boot/gate';
import { cn } from '@/lib/utils';
import { guideContent } from '@/lib/content';
import { GUIDE, SECTION_IDS } from '@/constants';

const DOCK = 'flex h-[min(34rem,72svh)] flex-col gap-4 rounded-lg border-[1.5px] border-line bg-glass p-5 shadow-brutal md:p-6';
const HEAD = 'flex items-center gap-3 border-b-[1.5px] border-line pb-4';
const NAME = 'text-base leading-tight tracking-[-0.01em] text-paper';
const STATUS = 'font-mono text-[11px] uppercase tracking-[0.14em] text-mut';
const FLOAT = 'fixed right-5 bottom-5 z-[60] flex flex-col items-end gap-3 lg:right-8 lg:bottom-8';
const SHEET =
  'flex h-[min(38rem,78svh)] w-[min(30rem,calc(100vw-2.5rem))] origin-bottom-right flex-col gap-4 rounded-lg border-[1.5px] border-line bg-void p-5 shadow-brutal motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-3 motion-safe:duration-200 motion-safe:ease-out';
const NUDGE =
  'max-w-60 rounded-lg rounded-br-sm border-[1.5px] border-line bg-void px-3.5 py-2.5 text-sm leading-[1.45] text-paper shadow-brutal motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:ease-out';
const DOT = 'absolute -top-1 -right-1 flex size-4 items-center justify-center';
const ICON = 'absolute transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none';
const LAUNCH =
  'relative size-16 cursor-pointer rounded-full border-[1.5px] border-ink bg-volt p-0 text-ink shadow-brutal transition-transform duration-200 ease-out hover:scale-105 hover:bg-volt motion-reduce:transition-none motion-reduce:animate-none';

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
  const [nudge, setNudge] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [unread, setUnread] = useState(false);
  const hereRef = useRef('');
  const exitRef = useRef(0);
  const [greeted, setGreeted] = useState(false);
  const ran = useRef(new Set());
  const dockRef = useRef(null);
  const spent = asked(messages) >= GUIDE.turns;

  useEffect(() => {
    let timer = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const id = idFor();
      const words = greeting.split(' ');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const step = reduced ? words.length : 1;
      let at = 0;
      timer = window.setInterval(
        () => {
          at = Math.min(at + step, words.length);
          setMessages([{ id, role: 'assistant', text: words.slice(0, at).join(' ') }]);
          if (at < words.length) return;
          window.clearInterval(timer);
          timer = 0;
          setGreeted(true);
        },
        reduced ? 0 : GUIDE.greetingWordMs
      );
    };
    const release = watchGate(start);
    const failsafe = window.setTimeout(start, GUIDE.greetLatestMs);
    return () => {
      release();
      window.clearTimeout(failsafe);
      window.clearInterval(timer);
      timer = 0;
    };
  }, [greeting]);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return undefined;
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          window.clearTimeout(exitRef.current);
          exitRef.current = 0;
          setLeaving(false);
          setFloating(true);
          return;
        }
        setLeaving(true);
        exitRef.current = window.setTimeout(() => {
          setFloating(false);
          setLeaving(false);
          exitRef.current = 0;
        }, GUIDE.dockExitMs);
      },
      { threshold: 0 }
    );
    watcher.observe(dock);
    return () => {
      watcher.disconnect();
      window.clearTimeout(exitRef.current);
      exitRef.current = 0;
    };
  }, []);

  useEffect(() => {
    const seen = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!seen.length) return undefined;
    const watcher = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (top) hereRef.current = top.target.id;
      },
      { threshold: [0.2, 0.6] }
    );
    seen.forEach((node) => watcher.observe(node));
    return () => watcher.disconnect();
  }, []);

  useEffect(() => {
    if (!floating || open || messages.length > 1) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const lines = guideContent.nudges;
    let hide = 0;
    const show = () => {
      setNudge(lines[hereRef.current] || lines.default);
      setUnread(true);
      hide = window.setTimeout(() => setNudge(''), GUIDE.nudgeHoldMs);
    };
    const first = window.setTimeout(show, GUIDE.nudgeFirstMs);
    const loop = window.setInterval(show, GUIDE.nudgeEveryMs);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(hide);
      window.clearInterval(loop);
    };
  }, [floating, open, messages.length]);

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
      greeted={greeted}
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
      <div ref={dockRef} className={DOCK} aria-hidden={floating}>
        {header}
        {chat('guide-hero', false)}
      </div>
      {floating
        ? createPortal(
            <div className={FLOAT}>
              {!open && nudge && !leaving ? (
                <p className={NUDGE} role='status'>
                  {nudge}
                </p>
              ) : null}
              {open ? (
                <div className={SHEET} role='dialog' aria-label={guideContent.title}>
                  {header}
                  {chat('guide-float', true)}
                </div>
              ) : null}
              <Button
                type='button'
                onClick={() => {
                  setUnread(false);
                  setOpen(!open);
                }}
                aria-expanded={open}
                aria-label={open ? guideContent.close : guideContent.open}
                className={cn(LAUNCH, leaving ? 'motion-safe:animate-dock-out' : 'motion-safe:animate-dock-in')}
              >
                <AgentMark className={cn(ICON, 'size-9', open ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
                {unread && !open ? (
                  <span aria-hidden='true' className={DOT}>
                    <span className='absolute inline-flex size-full rounded-full bg-ink opacity-60 motion-safe:animate-ping motion-reduce:hidden' />
                    <span className='relative inline-flex size-3.5 rounded-full border-[1.5px] border-ink bg-volt motion-safe:animate-beacon' />
                  </span>
                ) : null}
                <X
                  aria-hidden='true'
                  className={cn(ICON, 'size-8', open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0')}
                />
              </Button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
