import { footerContent } from '@/lib/content';
import { EMAIL, SITE, SOCIALS } from '@/constants';

const { palette, fonts, logo } = EMAIL;
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
const BODY_TYPE = `font-family:${fonts.sans};font-size:16px;line-height:1.6`;
const LABEL_TYPE = [
  `font-family:${fonts.mono}`,
  'font-size:12px',
  'line-height:1.5',
  'letter-spacing:0.08em',
  'text-transform:uppercase',
  `color:${palette.grey}`,
].join(';');
const FOOTER_TYPE = `font-family:${fonts.sans};font-size:14px;line-height:1.6;color:${palette.footerMut}`;
const DETAILS_TABLE = `margin:0 0 20px;border-collapse:collapse;border-bottom:1px solid ${palette.ink};`;
const MARK = `background-color:${palette.volt};padding:0 4px;-webkit-box-decoration-break:clone;box-decoration-break:clone;`;

export const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ENTITIES[char]);
export const withBreaks = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');
export const paragraph = (content, color = palette.inkSoft) => `<p style="margin:0 0 16px;${BODY_TYPE};color:${color};">${content}</p>`;
export const eyebrow = (content) => `<p style="margin:28px 0 10px;${LABEL_TYPE};">${content}</p>`;
export const strong = (content) => `<strong style="font-weight:600;">${content}</strong>`;
export const emailLink = (safeAddress) =>
  `<a href="mailto:${safeAddress}" style="color:${palette.ink};text-decoration:underline;">${safeAddress}</a>`;
const footerLink = (label, href) => `<a href="${href}" style="color:${palette.white};text-decoration:none;">${label}</a>`;

export const heading = ({ lead, mark }) =>
  `<h1 style="margin:0 0 24px;font-family:${fonts.display};font-size:38px;font-style:italic;font-weight:400;line-height:1.15;` +
  `color:${palette.ink};">${lead} <span style="${MARK}">${mark}</span></h1>`;

export const panel = (content) =>
  `<table ${TABLE} width="100%" style="margin:0 0 28px;border-collapse:separate;"><tr><td style="padding:16px 20px;` +
  `background-color:${palette.wash};border:1.5px solid ${palette.ink};border-radius:12px;${BODY_TYPE};color:${palette.ink};">` +
  `${content}</td></tr></table>`;

const detailRow = ({ name, value }) =>
  `<tr><td width="128" style="padding:15px 16px 11px 0;border-top:1px solid ${palette.ink};vertical-align:top;${LABEL_TYPE};">` +
  `${name}</td><td style="padding:11px 0;border-top:1px solid ${palette.ink};vertical-align:top;${BODY_TYPE};` +
  `color:${palette.ink};word-break:break-word;">${value}</td></tr>`;

export const details = (rows) =>
  rows.length ? `<table ${TABLE} width="100%" style="${DETAILS_TABLE}">${rows.map(detailRow).join('')}</table>` : '';

export const button = ({ label, href }) =>
  `<table ${TABLE} style="margin:8px 0 28px;border-collapse:separate;"><tr><td style="background-color:${palette.volt};` +
  `border:1.5px solid ${palette.ink};border-radius:999px;box-shadow:2px 2px 0 ${palette.ink};"><a href="${href}" ` +
  `style="display:inline-block;padding:12px 28px;font-family:${fonts.sans};font-size:15px;font-weight:600;color:${palette.ink};` +
  `text-decoration:none;">${label}</a></td></tr></table>`;

const masthead = (origin) =>
  `<tr><td style="padding:24px 32px;background-color:${palette.black};border-radius:18px 18px 0 0;"><a href="${origin}">` +
  `<img src="${origin}${logo.src}" width="${logo.width}" height="${logo.height}" alt="${SITE.name}" ` +
  `style="display:block;border:0;outline:none;"></a></td></tr>`;

const footer = (origin, note) => {
  const links = [footerLink(new URL(origin).host, origin), ...SOCIALS.map(({ label, href }) => footerLink(label, href))];
  const copyright = `© ${new Date().getFullYear()} ${SITE.name}. ${footerContent.rights}`;
  return (
    `<tr><td style="padding:28px 32px;background-color:${palette.black};border-radius:0 0 18px 18px;">` +
    `<p style="margin:0 0 20px;${FOOTER_TYPE};">${note}</p>` +
    `<p style="margin:0 0 20px;${FOOTER_TYPE};">${links.join('&nbsp;&nbsp;&nbsp;&nbsp;')}</p>` +
    `<p style="margin:0;padding-top:16px;border-top:1px solid ${palette.footerLine};${FOOTER_TYPE};font-size:13px;">${copyright}</p>` +
    `</td></tr>`
  );
};

export const emailDocument = ({ title, preheader, content, note, origin }) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
  `<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">` +
  `<title>${title}</title><link href="${EMAIL.fontsHref}" rel="stylesheet"></head>` +
  `<body style="margin:0;padding:0;background-color:${palette.wash};">` +
  `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` +
  `<table ${TABLE} width="100%" style="background-color:${palette.wash};"><tr><td align="center" style="padding:32px 16px;">` +
  `<table ${TABLE} width="100%" style="max-width:${EMAIL.width}px;background-color:${palette.white};` +
  `border:1.5px solid ${palette.ink};border-radius:20px;box-shadow:3px 3px 0 ${palette.ink};border-collapse:separate;">` +
  `${masthead(origin)}<tr><td style="padding:36px 32px 12px;">${content}</td></tr>${footer(origin, note)}` +
  `</table></td></tr></table></body></html>`;
