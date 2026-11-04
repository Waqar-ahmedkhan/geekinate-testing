import { footerContent } from '@/lib/content';
import { EMAIL, MAIL_SOCIALS, SITE } from '@/constants';

const { palette, fonts, logo } = EMAIL;
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
const BODY_TYPE = `font-family:${fonts.sans};font-size:16px;line-height:1.6`;
const SMALL_TYPE = `font-family:${fonts.sans};font-size:13px;line-height:1.6;color:${palette.grey}`;
const HEADING_TYPE = `font-family:${fonts.sans};font-size:24px;font-weight:600;line-height:1.3;letter-spacing:-0.01em`;
const UNDERLINE = `text-decoration:underline;text-decoration-color:${palette.volt};text-underline-offset:3px`;
const LINK = `color:${palette.ink};font-weight:600;${UNDERLINE}`;
const FOOTER_LINK = `color:${palette.grey};text-decoration:none`;
const FOOTER_GAP = '&nbsp;&nbsp;&middot;&nbsp;&nbsp;';

export const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);
export const withBreaks = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');
export const paragraph = (content, color = palette.inkSoft) => `<p style="margin:0 0 16px;${BODY_TYPE};color:${color};">${content}</p>`;
export const caption = (content) => `<p style="margin:28px 0 8px;${SMALL_TYPE};">${content}</p>`;
export const heading = (content) => `<h1 style="margin:0 0 24px;${HEADING_TYPE};color:${palette.ink};">${content}</h1>`;
export const emailLink = (safeAddress) => `<a href="mailto:${safeAddress}" style="color:${palette.ink};">${safeAddress}</a>`;
export const action = ({ label, href }) =>
  `<p style="margin:8px 0 28px;${BODY_TYPE};"><a href="${href}" style="${LINK};">${label}&nbsp;&rarr;</a></p>`;
const footerLine = (content, margin = '0 0 6px') => `<p style="margin:${margin};${SMALL_TYPE};">${content}</p>`;
const footerLink = (label, href) => `<a href="${href}" style="${FOOTER_LINK};">${label}</a>`;

export const quote = (content) =>
  `<table ${TABLE} width="100%" style="margin:0 0 24px;"><tr><td style="padding:2px 0 2px 16px;border-left:2px solid ${palette.volt};` +
  `${BODY_TYPE};color:${palette.ink};word-break:break-word;">${content}</td></tr></table>`;

const detailRow = ({ name, value }) =>
  `<tr><td width="104" style="padding:3px 16px 3px 0;vertical-align:top;${SMALL_TYPE};font-size:14px;">${name}</td>` +
  `<td style="padding:3px 0;vertical-align:top;${BODY_TYPE};font-size:15px;color:${palette.ink};word-break:break-word;">${value}</td></tr>`;

export const details = (rows) =>
  rows.length ? `<table ${TABLE} width="100%" style="margin:0 0 8px;">${rows.map(detailRow).join('')}</table>` : '';

const masthead = (origin) =>
  `<tr><td style="padding:0 0 36px;"><a href="${origin}"><img src="${origin}${logo.src}" width="${logo.width}" ` +
  `height="${logo.height}" alt="${SITE.name}" style="display:block;border:0;outline:none;"></a></td></tr>`;

const footer = (note) => {
  const links = MAIL_SOCIALS.map(({ label, href }) => footerLink(label, href));
  const copyright = `© ${new Date().getFullYear()} ${SITE.name}. ${footerContent.rights}`;
  return (
    `<tr><td style="padding:24px 0 0;border-top:1px solid ${palette.rule};">` +
    `${footerLine(note)}${footerLine(links.join(FOOTER_GAP))}${footerLine(copyright, '0')}</td></tr>`
  );
};

export const emailDocument = ({ title, preheader, content, note, origin }) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
  `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">` +
  `<title>${title}</title><link href="${EMAIL.fontsHref}" rel="stylesheet"></head>` +
  `<body style="margin:0;padding:0;background-color:${palette.white};">` +
  `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` +
  `<table ${TABLE} width="100%" style="background-color:${palette.white};"><tr><td align="center" style="padding:40px 24px;">` +
  `<table ${TABLE} width="100%" style="max-width:${EMAIL.width}px;">` +
  `${masthead(origin)}<tr><td style="padding:0 0 20px;">${content}</td></tr>${footer(note)}` +
  `</table></td></tr></table></body></html>`;
