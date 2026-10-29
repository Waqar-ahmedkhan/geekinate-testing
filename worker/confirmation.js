import { contactContent } from '@/lib/content';
import { EMAIL, SITE } from '@/constants';

const { confirmation } = contactContent;
const { palette, fonts, logo } = EMAIL;
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
const BODY_TYPE = `font-family:${fonts.sans};font-size:16px;line-height:1.6`;
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);
const withBreaks = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');
const paragraph = (content, color = palette.inkSoft) => `<p style="margin:0 0 16px;${BODY_TYPE};color:${color};">${content}</p>`;

const heading = ({ lead, mark }) =>
  `<h1 style="margin:0 0 24px;font-family:${fonts.display};font-size:38px;font-style:italic;font-weight:400;line-height:1.15;` +
  `color:${palette.ink};">${lead} <span style="background-color:${palette.volt};padding:0 4px;-webkit-box-decoration-break:clone;box-decoration-break:clone;">${mark}</span></h1>`;

const quote = (message) =>
  `<p style="margin:28px 0 10px;font-family:${fonts.mono};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;` +
  `color:${palette.grey};">${confirmation.quoted}</p>` +
  `<table ${TABLE} width="100%" style="margin:0 0 28px;border-collapse:separate;"><tr><td style="padding:16px 20px;` +
  `background-color:${palette.wash};border:1.5px solid ${palette.ink};border-radius:12px;${BODY_TYPE};color:${palette.ink};">` +
  `${withBreaks(message)}</td></tr></table>`;

const button = ({ label, href }, origin) =>
  `<table ${TABLE} style="margin:8px 0 28px;border-collapse:separate;"><tr><td style="background-color:${palette.volt};` +
  `border:1.5px solid ${palette.ink};border-radius:999px;box-shadow:2px 2px 0 ${palette.ink};"><a href="${origin}${href}" ` +
  `style="display:inline-block;padding:12px 28px;font-family:${fonts.sans};font-size:15px;font-weight:600;color:${palette.ink};` +
  `text-decoration:none;">${label}</a></td></tr></table>`;

const masthead = (origin) =>
  `<tr><td style="padding:24px 32px;background-color:${palette.black};border-radius:18px 18px 0 0;"><a href="${origin}">` +
  `<img src="${origin}${logo.src}" width="${logo.width}" height="${logo.height}" alt="${SITE.name}" ` +
  `style="display:block;border:0;outline:none;"></a></td></tr>`;

export const confirmationHtml = (body, origin) => {
  const content = [
    heading(confirmation.heading),
    paragraph(`${confirmation.greeting} ${escapeHtml(body.name)},`, palette.ink),
    paragraph(confirmation.intro),
    quote(body.message),
    paragraph(confirmation.outro),
    button(confirmation.action, origin),
    paragraph(`<strong style="font-weight:600;">${confirmation.signoff}</strong>`, palette.ink),
  ].join('');
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">` +
    `<title>${confirmation.subject}</title><link href="${EMAIL.fontsHref}" rel="stylesheet"></head>` +
    `<body style="margin:0;padding:0;background-color:${palette.wash};">` +
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${confirmation.intro}</div>` +
    `<table ${TABLE} width="100%" style="background-color:${palette.wash};"><tr><td align="center" style="padding:32px 16px;">` +
    `<table ${TABLE} width="100%" style="max-width:${EMAIL.width}px;background-color:${palette.white};` +
    `border:1.5px solid ${palette.ink};border-radius:20px;box-shadow:3px 3px 0 ${palette.ink};border-collapse:separate;">` +
    `${masthead(origin)}<tr><td style="padding:36px 32px 20px;">${content}</td></tr></table></td></tr></table></body></html>`
  );
};
