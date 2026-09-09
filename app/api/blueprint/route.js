import { createHash } from 'node:crypto';
import { APICallError, generateText, LoadAPIKeyError, Output } from 'ai';
import { blueprintRepair, blueprintSystem, blueprintUser } from '@/lib/ai/prompts';
import { blueprintOutput, validateBlueprint } from '@/lib/ai/schema';
import { BLUEPRINT } from '@/constants';

const hits = new Map();
const answers = new Map();

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const requestId = () => Math.random().toString(36).slice(2, 10);
const digest = (value) => createHash('sha256').update(value).digest('hex');
const normalised = (brief) => brief.toLowerCase().replace(/\s+/g, ' ');

const throttled = (key) => {
  const now = Date.now();
  const seen = (hits.get(key) || []).filter((stamp) => now - stamp < BLUEPRINT.window.ms);
  hits.forEach((stamps, id) => {
    if (!stamps.some((stamp) => now - stamp < BLUEPRINT.window.ms)) hits.delete(id);
  });
  if (seen.length >= BLUEPRINT.window.max) return true;
  hits.set(key, [...seen, now]);
  return false;
};

const remembered = (key) => {
  const held = answers.get(key);
  if (!held) return null;
  if (Date.now() - held.at > BLUEPRINT.cache.ms) {
    answers.delete(key);
    return null;
  }
  return held.blueprint;
};

const remember = (key, blueprint) => {
  if (answers.size >= BLUEPRINT.cache.max) answers.delete(answers.keys().next().value);
  answers.set(key, { at: Date.now(), blueprint });
};

const clamp = (value) => (typeof value === 'string' ? value.trim().slice(0, BLUEPRINT.limits.line) : value);
const tidy = (node) => {
  if (Array.isArray(node)) return node.map(tidy);
  if (node && typeof node === 'object') return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, tidy(value)]));
  return clamp(node);
};

const visitor = (request) => {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  return digest(`${process.env.AI_USER_SALT || ''}${address}`).slice(0, 32);
};

const foreign = (request) => {
  const site = request.headers.get('sec-fetch-site');
  return Boolean(site) && site !== 'same-origin';
};

const gatewayName = (error) => (typeof error?.name === 'string' && error.name.startsWith('Gateway') ? error.name : '');
const transportFailed = (error) => APICallError.isInstance(error) || LoadAPIKeyError.isInstance(error) || Boolean(gatewayName(error));

const ask = (messages, user) =>
  generateText({
    model: BLUEPRINT.model,
    system: blueprintSystem,
    messages,
    output: Output.object({ schema: blueprintOutput }),
    maxOutputTokens: BLUEPRINT.maxOutputTokens,
    temperature: 0,
    providerOptions: { gateway: { user, quotaEntityId: user, tags: [...BLUEPRINT.tags] } },
  });

const build = async (brief, user) => {
  const opening = [{ role: 'user', content: blueprintUser(brief) }];
  try {
    const { output } = await ask(opening, user);
    return output;
  } catch (error) {
    if (transportFailed(error)) throw error;
    const returned = typeof error?.text === 'string' && error.text ? error.text : '(no output)';
    const repairing = [...opening, { role: 'assistant', content: returned }, { role: 'user', content: blueprintRepair }];
    const { output } = await ask(repairing, user);
    return output;
  }
};

const UNCONFIGURED = ['GatewayAuthenticationError', 'GatewayForbiddenError'];

const statusFor = (error) => {
  const name = gatewayName(error);
  const code = typeof error?.statusCode === 'number' ? error.statusCode : 0;
  if (LoadAPIKeyError.isInstance(error) || UNCONFIGURED.includes(name) || code === 401 || code === 403) {
    return { error: 'not-configured', status: 503 };
  }
  if (name === 'GatewayRateLimitError' || code === 429) return { error: 'throttled', status: 429 };
  if (code === 402) return { error: 'paused', status: 503 };
  return { error: 'failed', status: 502 };
};

export async function POST(request) {
  if (foreign(request)) return Response.json({ error: 'invalid' }, { status: 400 });
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  if (clean(payload?.trap, 8)) return Response.json({ error: 'invalid' }, { status: 400 });
  const brief = clean(payload?.brief, BLUEPRINT.limits.brief);
  if (brief.length < BLUEPRINT.minBrief) return Response.json({ error: 'invalid', fields: { brief: 'required' } }, { status: 400 });
  if (!process.env.AI_GATEWAY_API_KEY) return Response.json({ error: 'not-configured' }, { status: 503 });
  const user = visitor(request);
  const key = digest(normalised(brief));
  const held = remembered(key);
  if (held) return Response.json({ ok: true, id: requestId(), blueprint: held, cached: true });
  if (throttled(user)) return Response.json({ error: 'throttled' }, { status: 429 });
  const id = requestId();
  try {
    const generated = await build(brief, user);
    const checked = validateBlueprint(tidy(generated));
    if (!checked.success) return Response.json({ error: 'unreadable', id }, { status: 422 });
    remember(key, checked.value);
    return Response.json({ ok: true, id, blueprint: checked.value });
  } catch (error) {
    const { error: reason, status } = statusFor(error);
    return Response.json({ error: reason, id }, { status });
  }
}
