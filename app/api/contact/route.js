const LIMITS = { name: 120, email: 200, company: 160, message: 4000, topic: 40 };
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 12;

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

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
    `From: ${body.name} <${body.email}>`,
    body.company ? `Company: ${body.company}` : null,
    body.topic ? `Closest to: ${body.topic}` : null,
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

const sendResend = async (body) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM,
      to: [process.env.CONTACT_TO],
      reply_to: body.email,
      subject: `New project enquiry from ${body.name}`,
      text: compose(body),
    }),
  });
  return response.ok;
};

export async function POST(request) {
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  if (clean(payload?.trap, 8)) return Response.json({ ok: true });
  const body = {
    name: clean(payload?.name, LIMITS.name),
    email: clean(payload?.email, LIMITS.email),
    company: clean(payload?.company, LIMITS.company),
    message: clean(payload?.message, LIMITS.message),
    topic: clean(payload?.topic, LIMITS.topic),
  };
  const fields = invalid(body);
  if (fields) return Response.json({ error: 'invalid', fields }, { status: 400 });
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  const resend = process.env.RESEND_API_KEY && process.env.CONTACT_TO && process.env.CONTACT_FROM;
  if (!webhook && !resend) return Response.json({ error: 'not-configured' }, { status: 503 });
  try {
    const sent = webhook ? await sendWebhook(webhook, body) : await sendResend(body);
    if (!sent) return Response.json({ error: 'failed' }, { status: 502 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'failed' }, { status: 502 });
  }
}
