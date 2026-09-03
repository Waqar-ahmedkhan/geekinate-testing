const lead = (ctx, size) => {
  ctx.beginPath();
  ctx.arc(0, -size * 0.16, size * 0.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, size * 0.36, size * 0.3, Math.PI, Math.PI * 2);
  ctx.stroke();
};

const mail = (ctx, size) => {
  const width = size * 0.76,
    height = size * 0.54;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 2);
  ctx.lineTo(0, height * 0.14);
  ctx.lineTo(width / 2, -height / 2);
  ctx.stroke();
};

const agent = (ctx, size) => {
  const width = size * 0.62,
    height = size * 0.5,
    top = -size * 0.12;
  ctx.beginPath();
  ctx.moveTo(0, top);
  ctx.lineTo(0, top - size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, top - size * 0.22, size * 0.055, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(-width / 2, top, width, height, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width / 2 - size * 0.08, top + height * 0.36);
  ctx.lineTo(-width / 2 - size * 0.08, top + height * 0.64);
  ctx.moveTo(width / 2 + size * 0.08, top + height * 0.36);
  ctx.lineTo(width / 2 + size * 0.08, top + height * 0.64);
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(side * width * 0.2, top + height * 0.44, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  });
};

const score = (ctx, size) => {
  const base = size * 0.3,
    gap = size * 0.24;
  [0.26, 0.42, 0.58].forEach((height, at) => {
    const x = (at - 1) * gap;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x, base - size * height);
    ctx.stroke();
  });
};

const enrich = (ctx, size) => {
  const radius = size * 0.3,
    lip = size * 0.11,
    top = -size * 0.22,
    foot = size * 0.22;
  ctx.beginPath();
  ctx.ellipse(0, top, radius, lip, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-radius, top);
  ctx.lineTo(-radius, foot);
  ctx.moveTo(radius, top);
  ctx.lineTo(radius, foot);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, foot, radius, lip, 0, 0, Math.PI);
  ctx.stroke();
};

const reply = (ctx, size) => {
  const width = size * 0.74,
    height = size * 0.54,
    top = -size * 0.34;
  ctx.beginPath();
  ctx.roundRect(-width / 2, top, width, height, size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width * 0.2, top + height);
  ctx.lineTo(-width * 0.28, top + height + size * 0.2);
  ctx.lineTo(0, top + height);
  ctx.stroke();
};

const approve = (ctx, size) => {
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, 0);
  ctx.lineTo(-size * 0.08, size * 0.24);
  ctx.lineTo(size * 0.32, -size * 0.26);
  ctx.stroke();
};

const crm = (ctx, size) => {
  const width = size * 0.72,
    height = size * 0.6;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 6);
  ctx.lineTo(width / 2, -height / 6);
  ctx.moveTo(0, -height / 6);
  ctx.lineTo(0, height / 2);
  ctx.stroke();
};

const booked = (ctx, size) => {
  const width = size * 0.68,
    height = size * 0.58,
    top = -size * 0.18;
  ctx.beginPath();
  ctx.roundRect(-width / 2, top, width, height, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width / 2, top + size * 0.15);
  ctx.lineTo(width / 2, top + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-width * 0.26, top - size * 0.13);
  ctx.lineTo(-width * 0.26, top);
  ctx.moveTo(width * 0.26, top - size * 0.13);
  ctx.lineTo(width * 0.26, top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, top + size * 0.35);
  ctx.lineTo(-size * 0.04, top + size * 0.43);
  ctx.lineTo(size * 0.14, top + size * 0.26);
  ctx.stroke();
};

export const GLYPHS = { lead, mail, agent, score, enrich, reply, approve, crm, booked };
