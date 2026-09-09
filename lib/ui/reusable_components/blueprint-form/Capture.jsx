'use client';

import { useRef, useState } from 'react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { blueprintForm } from '@/lib/content';
import { BLUEPRINT } from '@/constants';

const FIELD =
  'h-12 rounded-lg border-[1.5px] border-ink bg-paper px-4 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base';
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const SHELL = 'flex flex-col gap-4 rounded-lg border-[1.5px] border-ink bg-lift p-6 shadow-brutal md:p-8';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PANELS = { failed: 'failure', limited: 'rateLimited', unavailable: 'unavailable' };
const STATUS_BY_ERROR = { throttled: 'limited', 'not-configured': 'unavailable' };

export default function Capture({ blueprint }) {
  const { capture, errors } = blueprintForm;
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState('');
  const [status, setStatus] = useState('idle');
  const fieldRef = useRef(null);
  const trapRef = useRef(null);
  const pending = status === 'pending';
  const panel = PANELS[status] ? capture[PANELS[status]] : null;

  const check = (value) => {
    const written = value.trim();
    if (!written) return errors.email;
    return EMAIL_SHAPE.test(written) ? '' : errors.emailShape;
  };
  const send = async (event) => {
    event.preventDefault();
    const found = check(email);
    setInvalid(found);
    if (found) {
      fieldRef.current?.focus();
      return;
    }
    setStatus('pending');
    try {
      const response = await fetch('/api/blueprint/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, blueprint, trap: trapRef.current?.value || '' }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(STATUS_BY_ERROR[body?.error] || 'failed');
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent')
    return (
      <div className={SHELL} role='status'>
        <span className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-volt'>
          <Check aria-hidden='true' className='size-5 text-ink' />
        </span>
        <h4 className='text-xl leading-tight tracking-[-0.01em] text-ink'>{capture.success.title}</h4>
        <p className='text-base leading-[1.6] text-mut'>{capture.success.body}</p>
      </div>
    );

  return (
    <form onSubmit={send} noValidate className={SHELL} aria-busy={pending}>
      <div className='flex flex-col gap-1'>
        <h4 className='text-xl leading-tight tracking-[-0.01em] text-ink'>{capture.heading}</h4>
        <p className='max-w-[52ch] text-base leading-[1.6] text-mut'>{capture.body}</p>
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='blueprint-email' className={LABEL}>
          {capture.label}
        </Label>
        <div className='flex flex-wrap items-start gap-3'>
          <Input
            ref={fieldRef}
            id='blueprint-email'
            name='email'
            type='email'
            autoComplete='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setInvalid(check(email))}
            disabled={pending}
            maxLength={BLUEPRINT.limits.email}
            placeholder={capture.placeholder}
            aria-invalid={Boolean(invalid)}
            aria-describedby={invalid ? 'blueprint-email-error' : undefined}
            className={cn(FIELD, 'w-full sm:w-80', invalid && FIELD_BAD)}
          />
          <Button
            type='submit'
            disabled={pending}
            className='h-12 cursor-pointer rounded-full border-[1.5px] border-ink bg-volt px-7 text-ink shadow-brutal-sm hover:bg-volt'
          >
            {pending ? <LoaderCircle aria-hidden='true' className='size-4 animate-spin' /> : null}
            {pending ? capture.submit.pending : capture.submit.idle}
          </Button>
        </div>
        {invalid ? (
          <p id='blueprint-email-error' role='alert' className='flex items-start gap-1.5 text-sm leading-[1.4] text-ink'>
            <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-destructive' />
            {invalid}
          </p>
        ) : null}
      </div>
      <input ref={trapRef} type='text' name='trap' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
      {panel ? (
        <p role='status' className='text-sm leading-[1.5] text-mut'>
          <strong className='font-medium text-ink'>{panel.title}</strong> {panel.body}
        </p>
      ) : null}
    </form>
  );
}
