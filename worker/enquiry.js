import { action, caption, details, emailDocument, emailLink, escapeHtml, heading, quote, withBreaks } from './email';
import { contactContent } from '@/lib/content';

const { enquiry } = contactContent;
const FIELDS = ['email', 'company', 'topic', 'interests'];
const PREHEADER_LENGTH = 120;

const FIELD_VALUES = {
  email: ({ email }) => emailLink(escapeHtml(email)),
  company: ({ company }) => escapeHtml(company),
  topic: ({ topic }) => escapeHtml(topic),
  interests: ({ interests }) => escapeHtml(interests.join(', ')),
};

const fieldRows = (body) =>
  FIELDS.filter((field) => body[field]?.length).map((field) => ({ name: enquiry.labels[field], value: FIELD_VALUES[field](body) }));
export const enquirySubject = (body) => `${enquiry.subject} ${body.name}`;
const replyHref = (body) => `mailto:${encodeURIComponent(body.email)}?subject=${encodeURIComponent(`Re: ${enquirySubject(body)}`)}`;

export const enquiryHtml = (body, origin) => {
  const name = escapeHtml(body.name);
  const content = [
    heading(`${enquiry.heading} ${name}`),
    details(fieldRows(body)),
    caption(enquiry.message),
    quote(withBreaks(body.message)),
    action({ label: `${enquiry.reply} ${name}`, href: escapeHtml(replyHref(body)) }),
  ].join('');
  return emailDocument({
    title: escapeHtml(enquirySubject(body)),
    preheader: escapeHtml(body.message.slice(0, PREHEADER_LENGTH)),
    content,
    note: `${enquiry.note} ${new URL(origin).host}. ${enquiry.replyNote}`,
    origin,
  });
};
