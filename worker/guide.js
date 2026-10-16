import { createHash } from 'node:crypto';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText } from 'ai';
import { guideSystem } from '@/lib/ai/prompts';
import { guideTools } from '@/lib/ai/tools';
import { GUIDE } from '@/constants';

const hits = new Map();

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const digest = (value) => createHash('sha256').update(value).digest('hex');

const throttled = (key) => {
  const now = Date.now();
  const seen = (hits.get(key) || []).filter((stamp) => now - stamp < GUIDE.window.ms);
  hits.forEach((stamps, id) => {
    if (!stamps.some((stamp) => now - stamp < GUIDE.window.ms)) hits.delete(id);
  });
  if (seen.length >= GUIDE.window.max) return true;
  hits.set(key, [...seen, now]);
  return false;
};

const visitor = (request) => {
  const address = request.headers.get('cf-connecting-ip') || 'local';
  return digest(`${process.env.AI_USER_SALT || ''}${address}`).slice(0, 32);
};

const foreign = (request) => {
  const site = request.headers.get('sec-fetch-site');
  return Boolean(site) && site !== 'same-origin';
};

const textOf = (message) =>
  (message?.parts || [])
    .filter((part) => part?.type === 'text')
    .map((part) => part.text)
    .join(' ');

const trimmed = (messages) =>
  messages.slice(-GUIDE.turns * 2).map((message) => ({
    id: message.id,
    role: message.role === 'assistant' ? 'assistant' : 'user',
    parts: [{ type: 'text', text: clean(textOf(message), GUIDE.limits.message) }],
  }));

export async function POST(request) {
  if (foreign(request)) return Response.json({ error: 'invalid' }, { status: 400 });
  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }
  const messages = Array.isArray(payload?.messages) ? payload.messages : [];
  if (!messages.length) return Response.json({ error: 'invalid' }, { status: 400 });
  const asked = messages.filter((message) => message?.role === 'user').length;
  if (asked > GUIDE.turns) return Response.json({ error: 'capped' }, { status: 429 });
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: 'not-configured' }, { status: 503 });
  const user = visitor(request);
  if (throttled(user)) return Response.json({ error: 'throttled' }, { status: 429 });
  try {
    const history = await convertToModelMessages(trimmed(messages));
    const result = streamText({
      model: openai(GUIDE.model),
      system: guideSystem,
      messages: history,
      tools: guideTools,
      stopWhen: stepCountIs(2),
      maxOutputTokens: GUIDE.maxOutputTokens,
      temperature: 0.3,
      providerOptions: { openai: { user } },
    });
    return result.toUIMessageStreamResponse();
  } catch {
    return Response.json({ error: 'failed' }, { status: 502 });
  }
}
