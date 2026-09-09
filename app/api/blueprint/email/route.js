import { createHash } from 'node:crypto';
import { validateBlueprint } from '@/lib/ai/schema';
import { BLUEPRINT } from '@/constants';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const hits = new Map();

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const requestId = () => Math.random().toString(36).slice(2, 10);
const digest = (value) => createHash('sha256').update(value).digest('hex');

const throttled = (key) => {
  const now = Date.now();
  const seen = (hits.get(key) || []).filter((stamp) => now - stamp < BLUEPRINT.emailWindow.ms);
  hits.forEach((stamps, id) => {
    if (!stamps.some((stamp) => now - stamp < BLUEPRINT.emailWindow.ms)) hits.delete(id);
  });
  if (seen.length >= BLUEPRINT.emailWindow.max) return true;
  hits.set(key, [...seen, now]);
  return false;
};

const visitor = (request) => {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  return digest(`${process.env.AI_USER_SALT || ''}${address}`).slice(0, 32);
};

const foreign = (request) => {
  const site = request.headers.get('sec-fetch-site');
  return Boolean(site) && site !== 'same-origin';
};

const numbered = (rows, render) => rows.map((row, index) => `${String(index + 1).padStart(2, '0')}. ${render(row)}`);

const compose = (email, blueprint) =>
  [
    `Reply to: ${email}`,
    '',
    `In their words: ${blueprint.businessSummary}`,
    `Closest service: ${blueprint.pillar}`,
    '',
    'Today',
    ...numbered(blueprint.today, ({ step, friction }) => `${step} — ${friction}`),
    '',
    'With Geekinate',
    ...numbered(blueprint.automated, ({ step, handledBy }) => `${step} — ${handledBy}`),
    '',
    'Three things we would build',
    ...numbered(blueprint.opportunities, ({ title, outcome, effort }) => `${title} (${effort}) — ${outcome}`),
  ].join('\n');

const sendWebhook = async (url, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.ok;
};

const sendResend = async (email, blueprint) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM,
      to: [process.env.BLUEPRINT_TO || process.env.CONTACT_TO],
      reply_to: email,
      subject: `Blueprint request from ${email}`,
      text: compose(email, blueprint),
    }),
  });
  return response.ok;
};

export async function POST(request) {
  if (foreign(request)) return Response.json({ error: 'invalid' }, { status: 400 });
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  if (clean(payload?.trap, 8)) return Response.json({ ok: true });
  const email = clean(payload?.email, BLUEPRINT.limits.email);
  if (!email || !EMAIL_SHAPE.test(email)) {
    return Response.json({ error: 'invalid', fields: { email: email ? 'shape' : 'required' } }, { status: 400 });
  }
  const checked = validateBlueprint(payload?.blueprint);
  if (!checked.success) return Response.json({ error: 'invalid', fields: { blueprint: 'shape' } }, { status: 400 });
  if (throttled(visitor(request))) return Response.json({ error: 'throttled' }, { status: 429 });
  const webhook = process.env.BLUEPRINT_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  const resend = process.env.RESEND_API_KEY && (process.env.BLUEPRINT_TO || process.env.CONTACT_TO) && process.env.CONTACT_FROM;
  if (!webhook && !resend) return Response.json({ error: 'not-configured' }, { status: 503 });
  const id = requestId();
  try {
    const sent = webhook
      ? await sendWebhook(webhook, { id, email, blueprint: checked.value, text: compose(email, checked.value) })
      : await sendResend(email, checked.value);
    if (!sent) return Response.json({ error: 'failed', id }, { status: 502 });
    return Response.json({ ok: true, id });
  } catch {
    return Response.json({ error: 'failed', id }, { status: 502 });
  }
}
