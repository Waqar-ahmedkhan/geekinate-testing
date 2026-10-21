import { WorkerMailer } from 'worker-mailer';

const SMTP_PORT = 587;
const ADDRESS_SHAPE = /^(.*)<([^>]+)>$/;

const singleLine = (value) => value.replace(/\s+/g, ' ').trim();

const parseAddress = (value) => {
  const match = ADDRESS_SHAPE.exec(value.trim());
  return match ? { name: match[1].trim(), email: match[2].trim() } : { email: value.trim() };
};

const smtpReady = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
export const mailReady = (to) => Boolean(to && process.env.CONTACT_FROM && (smtpReady() || process.env.RESEND_API_KEY));

const sendSmtp = async ({ to, replyTo, subject, text }) => {
  await WorkerMailer.send(
    {
      host: process.env.SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      startTls: true,
      authType: 'plain',
      credentials: { username: process.env.SMTP_USER, password: process.env.SMTP_PASS },
    },
    { from: parseAddress(process.env.CONTACT_FROM), to, reply: replyTo, subject: singleLine(subject), text }
  );
  return true;
};

const sendResend = async ({ to, replyTo, subject, text }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.CONTACT_FROM, to: [to], reply_to: replyTo, subject, text }),
  });
  return response.ok;
};

export const sendMail = (message) => (smtpReady() ? sendSmtp(message) : sendResend(message));
