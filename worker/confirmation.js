import { button, details, emailDocument, escapeHtml, eyebrow, heading, panel, paragraph, strong, withBreaks } from './email';
import { fieldRows } from './enquiry';
import { contactContent } from '@/lib/content';
import { EMAIL } from '@/constants';

const { confirmation } = contactContent;
const { palette } = EMAIL;
const CHOICE_FIELDS = ['topic', 'interests'];

export const confirmationHtml = (body, origin) => {
  const content = [
    heading(confirmation.heading),
    paragraph(`${confirmation.greeting} ${escapeHtml(body.name)},`, palette.ink),
    paragraph(confirmation.intro),
    eyebrow(confirmation.quoted),
    details(fieldRows(body, CHOICE_FIELDS)),
    panel(withBreaks(body.message)),
    eyebrow(confirmation.nextLabel),
    paragraph(confirmation.next),
    paragraph(confirmation.outro),
    button({ label: confirmation.action.label, href: `${origin}${confirmation.action.href}` }),
    paragraph(strong(confirmation.signoff), palette.ink),
  ].join('');
  return emailDocument({
    title: confirmation.subject,
    preheader: confirmation.intro,
    content,
    note: `${confirmation.note} ${new URL(origin).host}.`,
    origin,
  });
};
