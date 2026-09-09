'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import Result from './Result';
import { revealResult } from './reveal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { registerSection } from '@/lib/ai/sections';
import { scrollToElement } from '@/lib/scroll/controller';
import { cn } from '@/lib/utils';
import { blueprintForm } from '@/lib/content';
import { BLUEPRINT, PAGE_ACTIONS, SERVICE_SECTIONS } from '@/constants';

const FIELD =
  'min-h-28 rounded-lg border-[1.5px] border-ink bg-paper px-4 py-3 text-base text-ink shadow-brutal-sm placeholder:text-grey/70 md:text-base';
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const PANEL = 'flex flex-col items-start gap-2 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';
const FORM = 'flex flex-col gap-6 rounded-lg border-[1.5px] border-ink bg-lift p-6 shadow-brutal md:p-8';
const EXAMPLE =
  'cursor-pointer rounded-full border-[1.5px] border-ink bg-paper px-4 py-2 text-left text-sm leading-[1.4] text-ink transition-colors duration-200 ease-brutal hover:bg-wash disabled:cursor-default';

const EMPTY = { brief: '' };
const PANELS = { failed: 'failure', unreadable: 'unreadable', limited: 'rateLimited', unavailable: 'unavailable' };
const STATUS_BY_ERROR = {
  throttled: 'limited',
  'not-configured': 'unavailable',
  paused: 'unavailable',
  unreadable: 'unreadable',
};

const validate = ({ brief }) => {
  const { errors } = blueprintForm;
  const written = brief.trim();
  const found = {};
  if (!written) found.brief = errors.brief;
  else if (written.length < BLUEPRINT.minBrief) found.brief = errors.briefShort;
  return found;
};

export default function BlueprintForm() {
  const { field, examples, submit, status: spoken } = blueprintForm;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [blueprint, setBlueprint] = useState(null);
  const formRef = useRef(null);
  const trapRef = useRef(null);
  const resultRef = useRef(null);
  const pending = status === 'pending';
  const panel = PANELS[status] ? blueprintForm[PANELS[status]] : null;

  useEffect(() => {
    const api = {
      [PAGE_ACTIONS.prefill]: ({ businessDescription }) => {
        const given = typeof businessDescription === 'string' ? businessDescription.slice(0, BLUEPRINT.limits.brief) : '';
        if (!given) return false;
        setValues({ brief: given });
        setTouched({});
        setErrors({});
        formRef.current?.elements.brief?.focus();
        return true;
      },
    };
    return registerSection(SERVICE_SECTIONS.blueprint, api);
  }, []);

  useLayoutEffect(() => {
    if (!blueprint) return undefined;
    const context = revealResult(resultRef.current);
    return () => context?.revert();
  }, [blueprint]);

  useEffect(() => {
    if (status !== 'ready') return;
    const node = resultRef.current;
    node?.focus({ preventScroll: true });
    if (node && node.getBoundingClientRect().top > window.innerHeight * 0.6) scrollToElement(node);
  }, [status]);

  const change = (event) => {
    const merged = { brief: event.target.value };
    setValues(merged);
    if (touched.brief) setErrors(validate(merged));
  };
  const blur = () => {
    setTouched({ brief: true });
    setErrors(validate(values));
  };
  const choose = (sentence) => () => {
    setValues({ brief: sentence });
    setTouched({});
    setErrors({});
    formRef.current?.elements.brief?.focus();
  };
  const again = () => {
    setBlueprint(null);
    setStatus('idle');
    setValues(EMPTY);
    setTouched({});
    setErrors({});
    formRef.current?.elements.brief?.focus();
  };
  const send = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setTouched({ brief: true });
    setErrors(found);
    if (found.brief) {
      formRef.current?.elements.brief?.focus();
      return;
    }
    setStatus('pending');
    try {
      const response = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: values.brief, trap: trapRef.current?.value || '' }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(STATUS_BY_ERROR[body?.error] || 'failed');
        formRef.current?.elements.brief?.focus();
        return;
      }
      setBlueprint(body.blueprint);
      setStatus('ready');
    } catch {
      setStatus('failed');
    }
  };

  const exampleEls = examples.items.map((sentence) => (
    <button key={sentence} type='button' onClick={choose(sentence)} disabled={pending} className={EXAMPLE}>
      {sentence}
    </button>
  ));
  const announced = pending ? spoken.pending : status === 'ready' ? spoken.ready : panel ? panel.title : '';

  return (
    <>
      <div className='flex flex-col gap-8'>
        <p role='status' aria-live='polite' className='sr-only'>
          {announced}
        </p>
        <form ref={formRef} onSubmit={send} noValidate className={FORM} aria-busy={pending}>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='brief' className={LABEL}>
              {field.label}
            </Label>
            <Textarea
              id='brief'
              name='brief'
              rows={3}
              value={values.brief}
              onChange={change}
              onBlur={blur}
              disabled={pending}
              maxLength={BLUEPRINT.limits.brief}
              placeholder={field.placeholder}
              aria-invalid={Boolean(errors.brief)}
              aria-describedby={errors.brief ? 'brief-error' : 'brief-helper'}
              className={cn(FIELD, errors.brief && FIELD_BAD)}
            />
            {errors.brief ? (
              <p id='brief-error' role='alert' className='flex items-start gap-1.5 text-sm leading-[1.4] text-ink'>
                <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-destructive' />
                {errors.brief}
              </p>
            ) : (
              <p id='brief-helper' className='text-sm leading-[1.4] text-mut'>
                {field.helper}
              </p>
            )}
          </div>
          <div className='flex flex-col gap-3'>
            <span className={LABEL}>{examples.label}</span>
            <div className='flex flex-wrap gap-2'>{exampleEls}</div>
          </div>
          <input ref={trapRef} type='text' name='trap' tabIndex={-1} autoComplete='off' aria-hidden='true' className='hidden' />
          <Button
            type='submit'
            disabled={pending}
            className='h-12 w-fit cursor-pointer rounded-full border-[1.5px] border-ink bg-volt px-7 text-ink shadow-brutal-sm hover:bg-volt'
          >
            {pending ? <LoaderCircle aria-hidden='true' className='size-4 animate-spin' /> : null}
            {pending ? submit.pending : submit.idle}
          </Button>
        </form>
        {panel ? (
          <div className={PANEL}>
            <h3 className='font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.1] tracking-[-0.01em] text-ink'>{panel.title}</h3>
            <p className='text-base leading-[1.6] text-mut'>{panel.body}</p>
          </div>
        ) : null}
      </div>
      {status === 'ready' && blueprint ? (
        <div className='lg:col-span-2'>
          <Result ref={resultRef} blueprint={blueprint} onAgain={again} />
        </div>
      ) : null}
    </>
  );
}
