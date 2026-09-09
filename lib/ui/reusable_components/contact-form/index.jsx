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
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const PANEL = 'flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';
const FORM = 'flex flex-col gap-6 rounded-lg border-[1.5px] border-ink bg-lift p-6 shadow-brutal md:p-8';
const CHIP =
  'cursor-pointer rounded-full border-[1.5px] border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-brutal disabled:cursor-default';
const CHIP_ON = 'bg-volt shadow-brutal-sm';
const CHIP_OFF = 'bg-paper hover:bg-wash';

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

const EMPTY = { name: '', email: '', company: '', message: '', topic: '' };

export default function ContactForm() {
  const { fields, topics, submit, success, failure } = contactContent;
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
  const blur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    const found = validate(values);
    setErrors((current) => ({ ...current, [field]: found[field] }));
  };
  const pick = (topic) => () => {
    setValues((current) => ({ ...current, topic: current.topic === topic ? '' : topic }));
  };
  const send = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setTouched({ name: true, email: true, message: true });
    setErrors(found);
    const first = ['name', 'email', 'message'].find((field) => found[field]);
    if (first) {
      formRef.current?.elements[first]?.focus();
      return;
    }
    setStatus('pending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, trap: trapRef.current?.value || '' }),
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
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    disabled: pending,
  });
  const topicEls = topics.options.map(({ value, label }) => (
    <button
      key={value}
      type='button'
      onClick={pick(value)}
      aria-pressed={values.topic === value}
      disabled={pending}
      className={cn(CHIP, values.topic === value ? CHIP_ON : CHIP_OFF)}
    >
      {label}
    </button>
  ));
  const errorFor = (field) =>
    errors[field] ? (
      <p id={`${field}-error`} role='alert' className='flex items-start gap-1.5 text-sm leading-[1.4] text-ink'>
        <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-destructive' />
        {errors[field]}
      </p>
    ) : null;

  if (status === 'sent')
    return (
      <div className={PANEL} role='status'>
        <span className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-volt'>
          <Check aria-hidden='true' className='size-5 text-ink' />
        </span>
        <h3 className='font-display text-3xl leading-none tracking-[-0.01em] text-ink'>{success.title}</h3>
        <p className='text-base leading-[1.6] text-mut'>{success.body}</p>
        <Button
          type='button'
          onClick={reset}
          variant='outline'
          className='mt-2 h-11 rounded-full border-[1.5px] border-ink bg-paper px-6 text-ink hover:bg-wash'
        >
          {success.again}
        </Button>
      </div>
    );

  return (
    <form ref={formRef} noValidate onSubmit={send} className={FORM}>
      <div className='flex flex-col gap-3'>
        <span className={LABEL}>
          {topics.label}
          <span className='text-grey'> ({topics.optional})</span>
        </span>
        <div role='group' aria-label={topics.label} className='flex flex-wrap gap-2'>
          {topicEls}
        </div>
      </div>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='name' className={LABEL}>
            {fields.name.label}
            <span className='text-destructive'>*</span>
          </Label>
          <Input
            {...fieldProps('name')}
            type='text'
            autoComplete={fields.name.autoComplete}
            placeholder={fields.name.placeholder}
            className={cn(FIELD, errors.name && FIELD_BAD)}
          />
          {errorFor('name')}
        </div>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='email' className={LABEL}>
            {fields.email.label}
            <span className='text-destructive'>*</span>
          </Label>
          <Input
            {...fieldProps('email')}
            type='email'
            inputMode='email'
            autoComplete={fields.email.autoComplete}
            placeholder={fields.email.placeholder}
            className={cn(FIELD, errors.email && FIELD_BAD)}
          />
          {errorFor('email')}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='company' className={LABEL}>
          {fields.company.label}
          <span className='text-grey'>({fields.company.optional})</span>
        </Label>
        <Input
          {...fieldProps('company')}
          type='text'
          autoComplete={fields.company.autoComplete}
          placeholder={fields.company.placeholder}
          className={FIELD}
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='message' className={LABEL}>
          {fields.message.label}
          <span className='text-destructive'>*</span>
        </Label>
        <Textarea
          {...fieldProps('message')}
          rows={6}
          placeholder={fields.message.placeholder}
          className={cn(
            'min-h-40 rounded-lg border-[1.5px] border-ink bg-paper px-4 py-3 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base',
            errors.message && FIELD_BAD
          )}
        />
        {errorFor('message')}
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
      <Button
        type='submit'
        disabled={pending}
        className='h-12 self-center rounded-full border-[1.5px] border-ink bg-volt px-8 text-base text-ink shadow-brutal hover:bg-volt/85'
      >
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
    </form>
  );
}
