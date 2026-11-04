import { confirmationHtml } from './confirmation';
import { enquiryHtml, enquirySubject } from './enquiry';
import { mailReady, sendMail } from './mailer';
import { createThrottle } from './throttle';
import { contactContent } from '@/lib/content';

const LIMITS = { name: 120, email: 200, company: 160, message: 4000, topic: 40 };
const INTERESTS = new Set(contactContent.interests.options);
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 12;
const WINDOW = { ms: 600000, max: 5 };
const { confirmation } = contactContent;
const { labels } = contactContent.enquiry;
const throttled = createThrottle(WINDOW);

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const pickInterests = (value) => (Array.isArray(value) ? [...new Set(value.filter((item) => INTERESTS.has(item)))] : []);

const invalid = (body) => {
  const found = {};
  if (!body.name) found.name = 'required';
  if (!body.email) found.email = 'required';
  else if (!EMAIL_SHAPE.test(body.email)) found.email = 'shape';
  if (!body.message || body.message.length < MESSAGE_MIN) found.message = 'required';
  return Object.keys(found).length ? found : null;
};

const compose = (body) =>
  [
    `${labels.from}: ${body.name} <${body.email}>`,
    body.company ? `${labels.company}: ${body.company}` : null,
    body.topic ? `${labels.topic}: ${body.topic}` : null,
    body.interests.length ? `${labels.interests}: ${body.interests.join(', ')}` : null,
    '',
    body.message,
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

const enquiry = (body, to, origin) => ({
  to,
  replyTo: body.email,
  subject: enquirySubject(body),
  text: compose(body),
  html: enquiryHtml(body, origin),
});

const receipt = (body) =>
  [
    `${confirmation.greeting} ${body.name},`,
    confirmation.intro,
    `${confirmation.quoted}:`,
    body.message,
    confirmation.next,
    confirmation.outro,
    confirmation.signoff,
  ].join('\n\n');

const acknowledgement = (body, replyTo, origin) => ({
  to: body.email,
  replyTo,
  subject: confirmation.subject,
  text: receipt(body),
  html: confirmationHtml(body, origin),
});
const attempt = (message) => sendMail(message).catch(() => false);
const deliver = async (body, to, origin) => {
  const message = enquiry(body, to, origin);
  const sent = (await attempt(message)) || (await attempt(message));
  if (sent) await attempt(acknowledgement(body, to, origin));
};

export async function POST(request, ctx) {
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  if (clean(payload?.trap, 8)) return Response.json({ ok: true });
  if (throttled(request.headers.get('cf-connecting-ip') || 'local')) return Response.json({ error: 'throttled' }, { status: 429 });
  const body = {
    name: clean(payload?.name, LIMITS.name),
    email: clean(payload?.email, LIMITS.email),
    company: clean(payload?.company, LIMITS.company),
    message: clean(payload?.message, LIMITS.message),
    topic: clean(payload?.topic, LIMITS.topic),
    interests: pickInterests(payload?.interests),
  };
  const fields = invalid(body);
  if (fields) return Response.json({ error: 'invalid', fields }, { status: 400 });
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const to = process.env.CONTACT_TO;
  if (!webhook && !mailReady(to)) return Response.json({ error: 'not-configured' }, { status: 503 });
  if (!webhook) {
    ctx.waitUntil(deliver(body, to, new URL(request.url).origin));
    return Response.json({ ok: true });
  }
  try {
    const sent = await sendWebhook(webhook, body);
    return sent ? Response.json({ ok: true }) : Response.json({ error: 'failed' }, { status: 502 });
  } catch {
    return Response.json({ error: 'failed' }, { status: 502 });
  }
}
