'use client';

import { useRef, useState } from 'react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { contactContent } from '@/lib/content';
import { SITE } from '@/constants';

const FIELD =
  'h-12 rounded-lg border-[1.5px] border-ink bg-paper px-4 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base';
const AREA =
  'min-h-40 rounded-lg border-[1.5px] border-ink bg-paper px-4 py-3 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base';
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const CHIP =
  'cursor-pointer rounded-full border-[1.5px] border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-brutal disabled:cursor-default';
const CHIP_ON = 'bg-volt shadow-brutal-sm';
const CHIP_OFF = 'bg-paper hover:bg-wash';
const PANEL = 'flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';
const FORM = 'rounded-lg border-[1.5px] border-ink bg-lift p-6 shadow-brutal md:p-8';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 12;

const validate = ({ name, email, message }) => {
  const { errors } = contactContent;
  const found = {};
  if (!name.trim()) found.name = errors.name;
  if (!email.trim()) found.email = errors.email;
  else if (!EMAIL_SHAPE.test(email.trim())) found.email = errors.emailShape;
  if (!message.trim()) found.message = errors.message;
  else if (message.trim().length < MESSAGE_MIN) found.message = errors.messageShort;
  return found;
};

const EMPTY = { name: '', email: '', company: '', message: '', interests: [] };

export default function ContactForm({ topic }) {
  const { fields, interests, submit, success, failure } = contactContent;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const formRef = useRef(null);
  const trapRef = useRef(null);
  const pending = status === 'pending';
  const change = (field) => (event) => {
    const merged = { ...values, [field]: event.target.value };
    setValues(merged);
    if (!touched[field]) return;
    setErrors((current) => ({ ...current, [field]: validate(merged)[field] }));
  };
  const toggle = (option) => () =>
    setValues((current) => ({
      ...current,
      interests: current.interests.includes(option) ? current.interests.filter((item) => item !== option) : [...current.interests, option],
    }));
  const blur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    const found = validate(values);
    setErrors((current) => ({ ...current, [field]: found[field] }));
  };
  const send = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setTouched({ name: true, email: true, message: true });
    setErrors(found);
    const first = ['message', 'name', 'email'].find((field) => found[field]);
    if (first) {
      formRef.current?.elements[first]?.focus();
      return;
    }
    setStatus('pending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, topic, trap: trapRef.current?.value || '' }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('sent');
      setValues(EMPTY);
      setTouched({});
      toast.success(success.title, { description: success.body });
    } catch {
      setStatus('failed');
      toast.error(failure.title, { description: failure.body });
    }
  };
  const reset = () => {
    setStatus('idle');
    setErrors({});
  };
  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: change(field),
    onBlur: blur(field),
    placeholder: fields[field].placeholder,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    disabled: pending,
  });
  const errorFor = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} role='alert' className='sr-only'>
        {errors[field]}
      </p>
    ) : null;
  const labelFor = (field) => {
    const { label, optional } = fields[field];
    const markEl = optional ? <span className='text-grey'> ({optional})</span> : <span className='text-destructive'>*</span>;
    return (
      <Label htmlFor={field} className={LABEL}>
        {label}
        {markEl}
      </Label>
    );
  };
  const interestEls = interests.options.map((option) => {
    const picked = values.interests.includes(option);
    return (
      <button
        key={option}
        type='button'
        aria-pressed={picked}
        disabled={pending}
        onClick={toggle(option)}
        className={cn(CHIP, picked ? CHIP_ON : CHIP_OFF)}
      >
        {option}
      </button>
    );
  });
  if (status === 'sent')
    return (
      <div className={PANEL} role='status'>
        <span className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-volt'>
          <Check aria-hidden='true' className='size-5 text-ink' />
        </span>
        <h3 className='font-display text-3xl leading-none tracking-[-0.01em] text-ink'>{success.title}</h3>
        <p className='text-base leading-[1.6] text-mut'>{success.body}</p>
        <Button type='button' onClick={reset} variant='line' size='pill-sm' className='mt-2'>
          {success.again}
        </Button>
      </div>
    );
  return (
    <form ref={formRef} noValidate onSubmit={send} className={FORM}>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3'>
          <span id='interests-label' className={LABEL}>
            {interests.label}
            <span className='text-grey'> ({interests.optional})</span>
          </span>
          <div role='group' aria-labelledby='interests-label' className='flex flex-wrap gap-2'>
            {interestEls}
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          {labelFor('message')}
          <Textarea {...fieldProps('message')} rows={6} className={cn(AREA, errors.message && FIELD_BAD)} />
          {errorFor('message')}
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            {labelFor('name')}
            <Input
              {...fieldProps('name')}
              type='text'
              autoComplete={fields.name.autoComplete}
              className={cn(FIELD, errors.name && FIELD_BAD)}
            />
            {errorFor('name')}
          </div>
          <div className='flex flex-col gap-2'>
            {labelFor('email')}
            <Input
              {...fieldProps('email')}
              type='email'
              inputMode='email'
              autoComplete={fields.email.autoComplete}
              className={cn(FIELD, errors.email && FIELD_BAD)}
            />
            {errorFor('email')}
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          {labelFor('company')}
          <Input {...fieldProps('company')} type='text' autoComplete={fields.company.autoComplete} className={FIELD} />
        </div>
        <Button type='submit' disabled={pending} variant='volt' size='pill' className='mt-2 self-center px-8'>
          {pending ? <LoaderCircle aria-hidden='true' className='size-4 animate-spin' /> : null}
          {pending ? submit.pending : submit.idle}
        </Button>
        {status === 'failed' ? (
          <div role='alert' className='flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-destructive bg-paper p-5'>
            <p className='flex items-start gap-2 text-base leading-[1.5] text-ink'>
              <CircleAlert aria-hidden='true' className='mt-1 size-4 shrink-0 text-destructive' />
              <span>
                <strong className='font-medium'>{failure.title}</strong> {failure.body}
              </span>
            </p>
            <a href={`mailto:${SITE.email}`} className='font-mono text-sm text-ink underline underline-offset-4 hover:text-grey'>
              {SITE.email}
            </a>
          </div>
        ) : null}
      </div>
      <input
        ref={trapRef}
        type='text'
        name='trap'
        tabIndex={-1}
        autoComplete='off'
        aria-hidden='true'
        className='pointer-events-none absolute left-[-9999px] size-px opacity-0'
      />
    </form>
  );
}
