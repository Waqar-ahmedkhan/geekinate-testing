import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.argv[2] || 'http://localhost:3007/';
const OUT = resolve(process.argv[3] || '.tmp/phone-globe');
const SECONDS = Number(process.argv[4] || 8);
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9777;
const STEP = 1000 / 60;
const FRAME_RATE = 30;
const PAINTED_BYTES = 150000;
const VIEW = { width: 600, height: 823, deviceScaleFactor: 2, mobile: true };

const CLOCK = `(() => {
  const realFrame = window.requestAnimationFrame.bind(window), realNow = performance.now.bind(performance), realDate = Date.now;
  const held = { manual: false, now: 0, base: 0, queue: [] };
  window.requestAnimationFrame = (callback) => {
    if (!held.manual) return realFrame(callback);
    held.queue.push(callback);
    return held.queue.length;
  };
  performance.now = () => (held.manual ? held.now : realNow());
  Date.now = () => (held.manual ? held.base + held.now : realDate());
  window.__holdClock = () => {
    held.now = realNow();
    held.base = realDate() - held.now;
    held.manual = true;
  };
  window.__stepClock = (ms) => {
    held.now += ms;
    const queue = held.queue;
    held.queue = [];
    queue.forEach((callback) => callback(held.now));
  };
  window.__holdClock();
})();`;
const CANVAS_ONLY =
  'body{visibility:hidden!important} body > div[class~="z-[1]"]{visibility:visible!important} ' +
  '[class*=phone-globe], video, div[style*=radial-gradient]{display:none!important} ' +
  '[data-globe-floor]{position:fixed!important;top:0!important;left:0!important;height:30px!important;margin:0!important}';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connect = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      return targets.find((target) => target.type === 'page').webSocketDebuggerUrl;
    } catch {
      await sleep(200);
    }
  }
  throw new Error('Chrome did not open a debugging port');
};

mkdirSync(OUT, { recursive: true });
const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${OUT}/.profile`,
  '--no-first-run',
  'about:blank',
]);
const socket = new WebSocket(await connect());
await new Promise((resolve) => socket.addEventListener('open', resolve));
let sent = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  pending.get(message.id)?.(message);
  pending.delete(message.id);
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    sent += 1;
    pending.set(sent, resolve);
    socket.send(JSON.stringify({ id: sent, method, params }));
  });
const run = (expression) => send('Runtime.evaluate', { expression, awaitPromise: true });
const capture = async () => Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).result.data, 'base64');
const frameName = (index) => `${OUT}/frame-${String(index).padStart(4, '0')}.png`;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', VIEW);
await send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK });
await send('Page.navigate', { url: URL });
await sleep(3000);
await run(`document.head.insertAdjacentHTML('beforeend', '<style>${CANVAS_ONLY}</style>')`);
await run('window.dispatchEvent(new Event("resize"))');
await sleep(300);
await run('window.dispatchEvent(new Event("keydown"))');
let painted = null;
while (!painted) {
  await run(`window.__stepClock(${STEP})`);
  await sleep(25);
  const shot = await capture();
  if (shot.length > PAINTED_BYTES) painted = shot;
}
writeFileSync(frameName(0), painted);
const frames = Math.round(SECONDS * FRAME_RATE);
for (let index = 1; index < frames; index += 1) {
  await run(`window.__stepClock(${STEP})`);
  await run(`window.__stepClock(${STEP})`);
  writeFileSync(frameName(index), await capture());
}
process.stdout.write(`${frames} frames in ${OUT}\n`);
socket.close();
chrome.kill();
