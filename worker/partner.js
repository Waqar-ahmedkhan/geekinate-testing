import { mailReady, sendMail } from './mailer';
import { createThrottle } from './throttle';
import { PARTNER } from '@/constants';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60000;
const WINDOW_MAX = 5;
const FIT_VALUES = ['development', 'games', 'marketing', 'unsure'];
const TYPE_VALUES = ['agency', 'consultant', 'founder', 'client', 'other'];

const throttled = createThrottle({ ms: WINDOW_MS, max: WINDOW_MAX });

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const picked = (value, allowed) => (allowed.includes(value) ? value : '');
const chosen = (value, allowed) => (Array.isArray(value) ? value.filter((item) => allowed.includes(item)) : []);
const requestId = () => Math.random().toString(36).slice(2, 10);

const invalid = (body) => {
  const found = {};
  if (!body.name || body.name.length < PARTNER.minName) found.name = 'required';
  if (!body.email) found.email = 'required';
  else if (!EMAIL_SHAPE.test(body.email)) found.email = 'shape';
  if (!body.consent) found.consent = 'required';
  if (body.intent === PARTNER.modes.partner && !body.partnerType) found.partnerType = 'required';
  if (body.intent === PARTNER.modes.lead) {
    if (!body.prospectName) found.prospectName = 'required';
    if (!body.prospectCompany) found.prospectCompany = 'required';
    if (body.prospectEmail && !EMAIL_SHAPE.test(body.prospectEmail)) found.prospectEmail = 'shape';
    if (!body.opportunity || body.opportunity.length < PARTNER.minOpportunity) found.opportunity = 'required';
    if (body.prospectEmail && !body.permission) found.permission = 'required';
  }
  return Object.keys(found).length ? found : null;
};

const subjectFor = (body) =>
  body.intent === PARTNER.modes.partner ? `Referral partner application from ${body.name}` : `Referral from ${body.name}`;

const compose = (body) =>
  [
    `Intent: ${body.intent}`,
    `From: ${body.name} <${body.email}>`,
    body.company ? `Company: ${body.company}` : null,
    body.intent === PARTNER.modes.partner ? `Partner type: ${body.partnerType}` : null,
    body.intent === PARTNER.modes.partner && body.website ? `Website: ${body.website}` : null,
    body.intent === PARTNER.modes.lead ? `Prospect: ${body.prospectName} at ${body.prospectCompany}` : null,
    body.intent === PARTNER.modes.lead && body.prospectEmail ? `Prospect email: ${body.prospectEmail}` : null,
    body.intent === PARTNER.modes.lead && body.fit.length ? `Fit: ${body.fit.join(', ')}` : null,
    '',
    body.intent === PARTNER.modes.partner ? body.network : body.opportunity,
  ]
    .filter((line) => line !== null)
    .join('\n');

const sendWebhook = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
};

const referral = (body, to) => ({ to, replyTo: body.email, subject: subjectFor(body), text: compose(body) });

export async function POST(request) {
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  if (clean(payload?.trap, 8)) return Response.json({ ok: true });
  const intent = picked(payload?.intent, Object.values(PARTNER.modes));
  if (!intent) return Response.json({ error: 'invalid' }, { status: 400 });
  const key = request.headers.get('cf-connecting-ip') || 'local';
  if (throttled(key)) return Response.json({ error: 'throttled' }, { status: 429 });
  const body = {
    intent,
    name: clean(payload?.name, PARTNER.limits.name),
    email: clean(payload?.email, PARTNER.limits.email),
    company: clean(payload?.company, PARTNER.limits.company),
    partnerType: picked(payload?.partnerType, TYPE_VALUES),
    website: clean(payload?.website, PARTNER.limits.website),
    network: clean(payload?.network, PARTNER.limits.network),
    prospectName: clean(payload?.prospectName, PARTNER.limits.prospectName),
    prospectCompany: clean(payload?.prospectCompany, PARTNER.limits.prospectCompany),
    prospectEmail: clean(payload?.prospectEmail, PARTNER.limits.email),
    fit: chosen(payload?.fit, FIT_VALUES),
    opportunity: clean(payload?.opportunity, PARTNER.limits.opportunity),
    permission: payload?.permission === true,
    consent: payload?.consent === true,
  };
  const fields = invalid(body);
  if (fields) return Response.json({ error: 'invalid', fields }, { status: 400 });
  const webhook = process.env.PARTNER_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  const to = process.env.PARTNER_TO || process.env.CONTACT_TO;
  if (!webhook && !mailReady(to)) return Response.json({ error: 'not-configured' }, { status: 503 });
  const id = requestId();
  try {
    const sent = webhook ? await sendWebhook(webhook, { ...body, id }) : await sendMail(referral(body, to));
    if (!sent) return Response.json({ error: 'failed', id }, { status: 502 });
    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ error: 'failed', id }, { status: 502 });
  }
}
