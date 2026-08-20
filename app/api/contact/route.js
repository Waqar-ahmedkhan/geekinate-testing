// The one server endpoint on this site, added 2026-08-19 with the contact form in section 05.
//
// ARCHITECTURE.md said there is no API layer, and until now that was true. A form has to post somewhere, so this is the smallest
// thing that can be honest about it: validate on the server, then hand the message to whatever the deployment is configured to send
// with. No database, no session, nothing stored here.
//
// **No new dependency.** Delivery goes out over plain fetch, so nothing was installed to make this work. Two routes are supported and
// the first one configured wins:
//
//   CONTACT_WEBHOOK_URL   posts the validated payload as JSON. Works with n8n, Make, Zapier, a Slack webhook, anything.
//   RESEND_API_KEY + CONTACT_TO + CONTACT_FROM   posts to Resend's REST API.
//
// With neither set the route answers 503 and the form shows its own failure panel with the address in it, which is a dead end a
// reader can still act on. That is deliberate: a form that silently accepts a message nobody receives is worse than one that says it
// could not send.
const LIMITS = { name: 120, email: 200, company: 160, message: 4000 };
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGE_MIN = 12;

// Everything that reaches the transport is trimmed and hard capped here rather than trusted from the client, because the client is
// not the only thing that can post to this route.
const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const invalid = (body) => {
  const found = {};
  if (!body.name) found.name = 'required';
  if (!body.email) found.email = 'required';
  else if (!EMAIL_SHAPE.test(body.email)) found.email = 'shape';
  if (!body.message || body.message.length < MESSAGE_MIN) found.message = 'required';
  return Object.keys(found).length ? found : null;
};

// Plain text, not HTML. Nothing here is escaped for markup because nothing here becomes markup, which removes the whole class of
// problem that comes from pasting a stranger's message into an email template.
const compose = (body) =>
  [`From: ${body.name} <${body.email}>`, body.company ? `Company: ${body.company}` : null, '', body.message]
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
      // reply_to, not from. Putting the sender's address in `from` is a forged header and it is what gets a domain's mail rejected.
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
  // The honeypot. A field no human ever sees, so anything in it came from something filling every input on the page. Answered with
  // 200 rather than an error, because telling a bot which check it failed is telling it how to pass next time.
  if (clean(payload?.trap, 8)) return Response.json({ ok: true });
  const body = {
    name: clean(payload?.name, LIMITS.name),
    email: clean(payload?.email, LIMITS.email),
    company: clean(payload?.company, LIMITS.company),
    message: clean(payload?.message, LIMITS.message),
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
