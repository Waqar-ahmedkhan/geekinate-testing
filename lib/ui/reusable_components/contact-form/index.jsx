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

// The contact form, and the only client component on this section. The heading and the ground it sits on are server rendered; only
// the part that holds state crosses the boundary.
//
// **Borders are written as `border-[1.5px] border-ink` here rather than as `border-brutal`.** That utility sets the whole `border`
// shorthand, so twMerge cannot see it conflicting with the `border border-input` the shadcn primitives already carry, and which of
// the two wins comes down to stylesheet order. Splitting width and colour into classes twMerge understands makes the override
// deterministic, and it is what lets the error state swap the colour without touching the width. The geometry is unchanged: 1.5px,
// ink, hard offset shadow, no soft elevation.
//
// Fields are 48px tall, not the shadcn default of 32. Anything a thumb has to hit wants 44px at minimum, and a 32px input on a phone
// is also short enough that iOS zooms the viewport when it takes focus.
const FIELD =
  'h-12 rounded-lg border-[1.5px] border-ink bg-paper px-4 text-base text-ink shadow-brutal-sm placeholder:text-grey/70 md:text-base';
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const PANEL = 'flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 12;

// Cause and fix, per field. Returned as an object rather than thrown one at a time so a single submit can report everything that is
// wrong at once instead of making the reader discover it a field per attempt.
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

const EMPTY = { name: '', email: '', company: '', message: '' };

export default function ContactForm() {
  const { fields, submit, success, failure } = contactContent;
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
    // Only re-validate a field the reader has already finished once, and only that field. Validating on every keystroke shows
    // somebody an error for a half typed address while they are still typing it, and validating the whole form here would light up
    // fields they have not reached yet.
    if (!touched[field]) return;
    setErrors((current) => ({ ...current, [field]: validate(merged)[field] }));
  };
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
    const first = ['name', 'email', 'message'].find((field) => found[field]);
    if (first) {
      // Focus the first field that failed. Without it a reader on a keyboard is told the form is wrong and left at the submit button
      // with no route back to the thing that caused it.
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
  const errorFor = (field) =>
    errors[field] ? (
      // role='alert' rather than colour alone. A red outline says nothing to a screen reader and nothing at all to a reader who
      // cannot separate the two colours, so the text carries the meaning and the colour only draws the eye to it.
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
        {/* bg-paper and text-ink are stated rather than left to the outline variant. That variant resolves to `bg-background`, and
            `--background` is the page's dark void everywhere, including inside `.on-paper`, which flips the border, shadow and muted
            tokens but deliberately not the page ground. Left alone the button would come out near black on a white section. */}
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
    <form ref={formRef} noValidate onSubmit={send} className='flex flex-col gap-6'>
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
          {/* type='email' rather than text, which is what puts the @ key on a phone keyboard. */}
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
          <span className='text-grey/70'>({fields.company.optional})</span>
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
            'min-h-40 rounded-lg border-[1.5px] border-ink bg-paper px-4 py-3 text-base text-ink shadow-brutal-sm placeholder:text-grey/70 md:text-base',
            errors.message && FIELD_BAD
          )}
        />
        {errorFor('message')}
      </div>
      {/* Honeypot. Off screen rather than display:none, because a field that is not rendered is not filled in by the scripts this is
          meant to catch. Hidden from assistive technology and out of the tab order, so no human ever meets it. */}
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
        // A failure the reader can act on. Retry first, then the address, so nobody who wanted to reach us is left with a dead end.
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
