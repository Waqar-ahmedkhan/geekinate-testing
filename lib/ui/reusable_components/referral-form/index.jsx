'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ctaSource, track } from '@/lib/analytics';
import { watchIntent } from '@/lib/partner/intent';
import { referralForm } from '@/lib/content';
import { PARTNER, PARTNER_EVENTS, SITE } from '@/constants';

const FIELD =
  'h-12 rounded-lg border-[1.5px] border-ink bg-paper px-4 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base';
const AREA =
  'min-h-32 rounded-lg border-[1.5px] border-ink bg-paper px-4 py-3 text-base text-ink shadow-brutal-sm placeholder:text-grey md:text-base';
const FIELD_BAD = 'border-destructive';
const LABEL = 'font-mono text-[11px] uppercase tracking-[0.14em] text-grey';
const PANEL = 'flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-ink bg-paper p-6 shadow-brutal md:p-8';
const FORM = 'flex flex-col gap-6 rounded-lg border-[1.5px] border-ink bg-lift p-6 shadow-brutal md:p-8';
const HIDE_DOT = '[&_[data-slot=radio-group-indicator]]:hidden';
const MODE = `aspect-auto h-12 w-full cursor-pointer items-center justify-center rounded-full border-[1.5px] border-ink text-sm text-ink transition-colors duration-200 ease-brutal disabled:cursor-default ${HIDE_DOT}`;
const PILL = `aspect-auto h-auto w-auto cursor-pointer rounded-full border-[1.5px] border-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors duration-200 ease-brutal disabled:cursor-default ${HIDE_DOT}`;
const CHECKED_ON = 'bg-volt shadow-brutal-sm';
const CHECKED_OFF = 'bg-paper hover:bg-wash';
const BOX =
  'size-5 rounded-[5px] border-[1.5px] border-ink bg-paper data-[state=checked]:border-ink data-[state=checked]:bg-volt data-[state=checked]:text-ink';
const TICK = 'flex cursor-pointer items-start gap-3 text-sm leading-[1.5] text-ink-soft';
const SUBMIT =
  'h-12 w-full cursor-pointer rounded-full border-[1.5px] border-ink bg-volt px-8 text-base text-ink shadow-brutal hover:bg-volt/85 sm:w-auto sm:self-center';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ORDER = {
  [PARTNER.modes.partner]: ['name', 'email', 'partnerType', 'consent'],
  [PARTNER.modes.lead]: ['name', 'email', 'prospectName', 'prospectCompany', 'prospectEmail', 'opportunity', 'permission', 'consent'],
};
const EMPTY = {
  intent: PARTNER.modes.partner,
  name: '',
  email: '',
  company: '',
  partnerType: '',
  website: '',
  network: '',
  prospectName: '',
  prospectCompany: '',
  prospectEmail: '',
  fit: [],
  opportunity: '',
  permission: false,
  consent: false,
};

const validate = (values) => {
  const { errors } = referralForm;
  const found = {};
  const name = values.name.trim();
  const email = values.email.trim();
  if (!name) found.name = errors.name;
  else if (name.length < PARTNER.minName) found.name = errors.nameShort;
  if (!email) found.email = errors.email;
  else if (!EMAIL_SHAPE.test(email)) found.email = errors.emailShape;
  if (values.intent === PARTNER.modes.partner && !values.partnerType) found.partnerType = errors.partnerType;
  if (values.intent === PARTNER.modes.lead) {
    const prospectEmail = values.prospectEmail.trim();
    const opportunity = values.opportunity.trim();
    if (!values.prospectName.trim()) found.prospectName = errors.prospectName;
    if (!values.prospectCompany.trim()) found.prospectCompany = errors.prospectCompany;
    if (prospectEmail && !EMAIL_SHAPE.test(prospectEmail)) found.prospectEmail = errors.prospectEmailShape;
    if (!opportunity) found.opportunity = errors.opportunity;
    else if (opportunity.length < PARTNER.minOpportunity) found.opportunity = errors.opportunityShort;
    if (prospectEmail && !values.permission) found.permission = errors.permission;
  }
  if (!values.consent) found.consent = errors.consent;
  return found;
};

export default function ReferralForm() {
  const { mode, shared, partner, lead, summary, failure, rateLimited } = referralForm;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');
  const [listed, setListed] = useState(0);
  const [started, setStarted] = useState(false);
  const formRef = useRef(null);
  const summaryRef = useRef(null);
  const legendRef = useRef(null);
  const trapRef = useRef(null);
  const pending = status === 'pending';
  const asPartner = values.intent === PARTNER.modes.partner;
  const copy = asPartner ? partner : lead;

  useEffect(() => {
    const apply = (focus) => {
      const hash = window.location.hash.slice(1);
      const picked = Object.entries(PARTNER.hashes).find(([, value]) => value === hash);
      if (!picked) return;
      const intent = PARTNER.modes[picked[0]];
      setValues((current) => ({ ...current, intent }));
      track(PARTNER_EVENTS.modeSelected, { intent, source: 'cta' });
      if (focus) legendRef.current?.focus();
    };
    apply(false);
    const onHash = () => apply(true);
    const onPick = (intent) => {
      setValues((current) => ({ ...current, intent }));
      track(PARTNER_EVENTS.modeSelected, { intent, source: 'cta' });
      legendRef.current?.focus();
    };
    const unwatch = watchIntent(onPick);
    window.addEventListener('hashchange', onHash);
    return () => {
      unwatch();
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  useEffect(() => {
    if (listed > 0) summaryRef.current?.focus();
  }, [listed]);

  const begin = (intent) => {
    if (started) return;
    setStarted(true);
    track(PARTNER_EVENTS.formStart, { intent, cta_source: ctaSource.value });
  };
  const revalidate = (merged, field) => {
    if (!touched[field]) return;
    setErrors((current) => ({ ...current, [field]: validate(merged)[field] }));
  };
  const change = (field) => (event) => {
    const merged = { ...values, [field]: event.target.value };
    setValues(merged);
    begin(merged.intent);
    revalidate(merged, field);
  };
  const blur = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validate(values)[field] }));
  };
  const tick = (field) => (checked) => {
    const merged = { ...values, [field]: checked === true };
    setValues(merged);
    begin(merged.intent);
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: validate(merged)[field] }));
  };
  const pickMode = (intent) => {
    setValues((current) => ({ ...current, intent }));
    setErrors({});
    setListed(0);
    track(PARTNER_EVENTS.modeSelected, { intent, source: 'control' });
  };
  const pickType = (partnerType) => {
    const merged = { ...values, partnerType };
    setValues(merged);
    begin(merged.intent);
    setErrors((current) => ({ ...current, partnerType: validate(merged).partnerType }));
  };
  const toggleFit = (value) => (checked) => {
    setValues((current) => ({
      ...current,
      fit: checked === true ? [...current.fit, value] : current.fit.filter((item) => item !== value),
    }));
  };
  const focusField = (field) => () => {
    const node = formRef.current?.querySelector(`#${field}`);
    (node?.querySelector('button,input,textarea') || node)?.focus();
  };
  const send = async (event) => {
    event.preventDefault();
    const found = validate(values);
    const order = ORDER[values.intent];
    setTouched(Object.fromEntries(order.map((field) => [field, true])));
    setErrors(found);
    if (order.some((field) => found[field])) {
      setListed((count) => count + 1);
      order
        .filter((field) => found[field])
        .forEach((field) => track(PARTNER_EVENTS.validationError, { intent: values.intent, field_name: field, error_code: 'invalid' }));
      return;
    }
    setListed(0);
    setStatus('pending');
    track(PARTNER_EVENTS.formSubmit, { intent: values.intent, cta_source: ctaSource.value });
    try {
      const response = await fetch('/api/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source: PARTNER.path, trap: trapRef.current?.value || '' }),
      });
      if (response.status === 429) throw new Error('rate');
      if (!response.ok) throw new Error(String(response.status));
      const body = await response.json().catch(() => ({}));
      setStatus('sent');
      setValues({ ...EMPTY, intent: values.intent });
      setTouched({});
      setStarted(false);
      track(PARTNER_EVENTS.formSuccess, { intent: values.intent, submission_id: body.id || '' });
    } catch (error) {
      const limited = error.message === 'rate';
      setStatus(limited ? 'limited' : 'failed');
      track(PARTNER_EVENTS.formFailure, { intent: values.intent, error_code: limited ? 'rate_limited' : 'request_failed' });
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
      <p id={`${field}-error`} className='flex items-start gap-1.5 text-sm leading-[1.4] text-ink'>
        <CircleAlert aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-destructive' />
        {errors[field]}
      </p>
    ) : null;
  const labelFor = (field, text, optional) => (
    <Label htmlFor={field} className={LABEL}>
      {text}
      {optional ? <span className='text-grey'> ({optional})</span> : <span className='text-destructive'>*</span>}
    </Label>
  );
  const modeEls = mode.options.map(({ value, label }) => (
    <RadioGroupItem key={value} value={value} disabled={pending} className={cn(MODE, values.intent === value ? CHECKED_ON : CHECKED_OFF)}>
      {label}
    </RadioGroupItem>
  ));
  const typeEls = partner.type.options.map(({ value, label }) => (
    <RadioGroupItem
      key={value}
      value={value}
      disabled={pending}
      className={cn(PILL, values.partnerType === value ? CHECKED_ON : CHECKED_OFF)}
    >
      {label}
    </RadioGroupItem>
  ));
  const fitEls = lead.fit.options.map(({ value, label }) => (
    <Label key={value} htmlFor={`fit-${value}`} className={TICK}>
      <Checkbox
        id={`fit-${value}`}
        checked={values.fit.includes(value)}
        onCheckedChange={toggleFit(value)}
        disabled={pending}
        className={BOX}
      />
      {label}
    </Label>
  ));
  const listedEls = ORDER[values.intent]
    .filter((field) => errors[field])
    .map((field) => (
      <li key={field}>
        <button type='button' onClick={focusField(field)} className='text-left underline decoration-destructive underline-offset-4'>
          {errors[field]}
        </button>
      </li>
    ));

  if (status === 'sent')
    return (
      <div className={PANEL} role='status' aria-live='polite'>
        <span className='flex size-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-volt'>
          <Check aria-hidden='true' className='size-5 text-ink' />
        </span>
        <h3 className='font-display text-3xl leading-none tracking-[-0.01em] text-ink'>{copy.success.title}</h3>
        <p className='text-base leading-[1.6] text-mut'>{copy.success.body}</p>
        <Button
          type='button'
          onClick={reset}
          variant='outline'
          className='mt-2 h-11 cursor-pointer rounded-full border-[1.5px] border-ink bg-paper px-6 text-ink hover:bg-wash'
        >
          {copy.success.again}
        </Button>
      </div>
    );

  return (
    <form ref={formRef} noValidate onSubmit={send} className={FORM}>
      {listed > 0 ? (
        <Alert
          ref={summaryRef}
          tabIndex={-1}
          className='rounded-lg border-[1.5px] border-destructive bg-paper p-5 text-ink outline-none'
          aria-live='polite'
        >
          <CircleAlert aria-hidden='true' className='text-destructive' />
          <AlertTitle className='text-base font-medium text-ink'>{summary.title}</AlertTitle>
          <ul className='mt-2 flex list-disc flex-col gap-1 pl-4 text-sm leading-[1.5] text-ink-soft'>{listedEls}</ul>
        </Alert>
      ) : null}
      <div className='flex flex-col gap-3'>
        <span ref={legendRef} tabIndex={-1} className={cn(LABEL, 'outline-none')}>
          {mode.label}
        </span>
        <RadioGroup value={values.intent} onValueChange={pickMode} aria-label={mode.label} className='grid gap-2 sm:grid-cols-2'>
          {modeEls}
        </RadioGroup>
      </div>
      <div className='grid gap-6 md:grid-cols-2'>
        <div className='flex flex-col gap-2'>
          {labelFor('name', shared.name.label)}
          <Input
            {...fieldProps('name')}
            type='text'
            maxLength={PARTNER.limits.name}
            autoComplete={shared.name.autoComplete}
            placeholder={shared.name.placeholder}
            className={cn(FIELD, errors.name && FIELD_BAD)}
          />
          {errorFor('name')}
        </div>
        <div className='flex flex-col gap-2'>
          {labelFor('email', shared.email.label)}
          <Input
            {...fieldProps('email')}
            type='email'
            inputMode='email'
            maxLength={PARTNER.limits.email}
            autoComplete={shared.email.autoComplete}
            placeholder={shared.email.placeholder}
            className={cn(FIELD, errors.email && FIELD_BAD)}
          />
          {errorFor('email')}
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {labelFor('company', shared.company.label, shared.company.optional)}
        <Input
          {...fieldProps('company')}
          type='text'
          maxLength={PARTNER.limits.company}
          autoComplete={shared.company.autoComplete}
          placeholder={shared.company.placeholder}
          className={FIELD}
        />
      </div>
      {asPartner ? (
        <>
          <div className='flex flex-col gap-3'>
            <span className={LABEL}>
              {partner.type.label}
              <span className='text-destructive'>*</span>
            </span>
            <RadioGroup
              id='partnerType'
              value={values.partnerType}
              onValueChange={pickType}
              aria-label={partner.type.label}
              aria-invalid={Boolean(errors.partnerType)}
              className='flex flex-row flex-wrap gap-2'
            >
              {typeEls}
            </RadioGroup>
            {errorFor('partnerType')}
          </div>
          <div className='flex flex-col gap-2'>
            {labelFor('website', partner.website.label, partner.website.optional)}
            <Input
              {...fieldProps('website')}
              type='url'
              inputMode='url'
              maxLength={PARTNER.limits.website}
              autoComplete={partner.website.autoComplete}
              placeholder={partner.website.placeholder}
              className={FIELD}
            />
          </div>
          <div className='flex flex-col gap-2'>
            {labelFor('network', partner.network.label, partner.network.optional)}
            <Textarea
              {...fieldProps('network')}
              rows={4}
              maxLength={PARTNER.limits.network}
              placeholder={partner.network.placeholder}
              className={AREA}
            />
          </div>
        </>
      ) : (
        <>
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='flex flex-col gap-2'>
              {labelFor('prospectName', lead.prospectName.label)}
              <Input
                {...fieldProps('prospectName')}
                type='text'
                maxLength={PARTNER.limits.prospectName}
                autoComplete='off'
                placeholder={lead.prospectName.placeholder}
                className={cn(FIELD, errors.prospectName && FIELD_BAD)}
              />
              {errorFor('prospectName')}
            </div>
            <div className='flex flex-col gap-2'>
              {labelFor('prospectCompany', lead.prospectCompany.label)}
              <Input
                {...fieldProps('prospectCompany')}
                type='text'
                maxLength={PARTNER.limits.prospectCompany}
                autoComplete='off'
                placeholder={lead.prospectCompany.placeholder}
                className={cn(FIELD, errors.prospectCompany && FIELD_BAD)}
              />
              {errorFor('prospectCompany')}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            {labelFor('prospectEmail', lead.prospectEmail.label, lead.prospectEmail.optional)}
            <Input
              {...fieldProps('prospectEmail')}
              type='email'
              inputMode='email'
              maxLength={PARTNER.limits.email}
              autoComplete='off'
              placeholder={lead.prospectEmail.placeholder}
              className={cn(FIELD, errors.prospectEmail && FIELD_BAD)}
            />
            <p className='text-sm leading-[1.4] text-grey'>{lead.prospectEmail.helper}</p>
            {errorFor('prospectEmail')}
          </div>
          <div className='flex flex-col gap-3'>
            <span className={LABEL}>
              {lead.fit.label}
              <span className='text-grey'> ({lead.fit.optional})</span>
            </span>
            <div role='group' aria-label={lead.fit.label} className='flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6'>
              {fitEls}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            {labelFor('opportunity', lead.opportunity.label)}
            <Textarea
              {...fieldProps('opportunity')}
              rows={5}
              maxLength={PARTNER.limits.opportunity}
              placeholder={lead.opportunity.placeholder}
              className={cn(AREA, errors.opportunity && FIELD_BAD)}
            />
            {errorFor('opportunity')}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='permission' className={TICK}>
              <Checkbox
                id='permission'
                name='permission'
                checked={values.permission}
                onCheckedChange={tick('permission')}
                disabled={pending}
                aria-invalid={Boolean(errors.permission)}
                className={BOX}
              />
              {lead.permission}
            </Label>
            {errorFor('permission')}
          </div>
        </>
      )}
      <div className='flex flex-col gap-2'>
        <Label htmlFor='consent' className={TICK}>
          <Checkbox
            id='consent'
            name='consent'
            checked={values.consent}
            onCheckedChange={tick('consent')}
            disabled={pending}
            aria-invalid={Boolean(errors.consent)}
            className={BOX}
          />
          {copy.consent}
        </Label>
        {errorFor('consent')}
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
      <Button type='submit' disabled={pending} className={SUBMIT}>
        {pending ? <LoaderCircle aria-hidden='true' className='size-4 animate-spin' /> : null}
        {pending ? copy.submit.pending : copy.submit.idle}
      </Button>
      {status === 'failed' || status === 'limited' ? (
        <div
          role='status'
          aria-live='polite'
          className='flex flex-col items-start gap-3 rounded-lg border-[1.5px] border-destructive bg-paper p-5'
        >
          <p className='flex items-start gap-2 text-base leading-[1.5] text-ink'>
            <CircleAlert aria-hidden='true' className='mt-1 size-4 shrink-0 text-destructive' />
            <span>
              <strong className='font-medium'>{status === 'limited' ? rateLimited.title : failure.title}</strong>{' '}
              {status === 'limited' ? rateLimited.body : failure.body}
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
