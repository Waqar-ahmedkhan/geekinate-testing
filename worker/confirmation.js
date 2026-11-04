import { action, caption, emailDocument, escapeHtml, heading, paragraph, quote, withBreaks } from './email';
import { contactContent } from '@/lib/content';
import { EMAIL } from '@/constants';

const { confirmation } = contactContent;
const { palette } = EMAIL;

export const confirmationHtml = (body, origin) => {
  const content = [
    heading(confirmation.subject),
    paragraph(`${confirmation.greeting} ${escapeHtml(body.name)},`, palette.ink),
    paragraph(confirmation.intro),
    caption(confirmation.quoted),
    quote(withBreaks(body.message)),
    paragraph(confirmation.outro),
    action({ label: confirmation.action.label, href: `${origin}${confirmation.action.href}` }),
    paragraph(confirmation.signoff, palette.ink),
  ].join('');
  return emailDocument({
    title: confirmation.subject,
    preheader: confirmation.intro,
    content,
    note: `${confirmation.note} ${new URL(origin).host}.`,
    origin,
  });
};
