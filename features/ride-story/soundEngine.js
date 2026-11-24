// Shared procedural Web Audio soundscape for The Living Fieldbook:
// synced to hero character entrances (left slide, top drop, right glide, bottom rise),
// 2026 camera shutter flash, sticker slaps, and scroll-triggered timeline paper/pencil reveals.

const CHORDS = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 329.63], // G6
  [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
];

const BASS_NOTES = [130.81, 110.0, 87.31, 98.0, 130.81];

function createNoiseBuffer(ctx, seconds = 0.65) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = 0.72 * last + 0.28 * white;
    data[i] = last;
  }
  return buffer;
}

export class FieldbookSound {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.enabled = true;
    this.output = null;
    this.lastScrollSoundAt = 0;
    this.cutCount = 0;
    this.storySources = new Set();
  }

  async enable() {
    this.enabled = true;
    window.dispatchEvent(new CustomEvent('fieldbook-sound', { detail: true }));
    return this.unlock();
  }

  async unlock() {
    if (!this.enabled) return false;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this.noiseBuffer = createNoiseBuffer(this.ctx, 0.65);
        this.output = this.ctx.createGain();
        this.output.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this.output.gain.setTargetAtTime(this.enabled ? 1 : 0, this.ctx.currentTime, 0.025);
      return this.enabled && this.ctx.state === 'running';
    } catch {
      return false;
    }
  }

  disable() {
    this.enabled = false;
    if (this.ctx && this.output) this.output.gain.setTargetAtTime(0, this.ctx.currentTime, 0.025);
    window.dispatchEvent(new CustomEvent('fieldbook-sound', { detail: false }));
  }

  createStorySource(kind) {
    const source = kind === 'oscillator' ? this.ctx.createOscillator() : this.ctx.createBufferSource();
    this.storySources.add(source);
    source.addEventListener('ended', () => this.storySources.delete(source), { once: true });
    return source;
  }

  stopStory() {
    this.storySources.forEach((source) => source.stop());
    this.storySources.clear();
  }

  playPortraitWhoosh(duration, variation = 0) {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const source = this.createStorySource('buffer');
    source.buffer = this.noiseBuffer;
    source.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(500 + variation * 90, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + duration * 0.25);
    filter.frequency.exponentialRampToValueAtTime(480, now + duration);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(this.output);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start(now);
    source.stop(now + duration);
  }

  playUiTap() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.createStorySource('oscillator');
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.045);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain).connect(this.output);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  playPageTurn() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const src = this.createStorySource('buffer');
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(640, now);
    filter.frequency.exponentialRampToValueAtTime(1950, now + 0.09);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.22);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

    src.connect(filter).connect(gain).connect(this.output);
    src.start(now);
    src.stop(now + 0.26);
  }

  // Top-down falling whoosh + cushioned gravity thud when Bilal drops from the top edge
  playDropThud() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Falling pitch sweep
    const fall = this.createStorySource('oscillator');
    const fg = this.ctx.createGain();
    fall.type = 'sine';
    fall.frequency.setValueAtTime(480, now);
    fall.frequency.exponentialRampToValueAtTime(115, now + 0.28);
    fg.gain.setValueAtTime(0.001, now);
    fg.gain.linearRampToValueAtTime(0.06, now + 0.06);
    fg.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    fall.connect(fg).connect(this.output);
    fall.start(now);
    fall.stop(now + 0.31);

    // Cushioned landing thud
    const thud = this.createStorySource('oscillator');
    const tg = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(175, now + 0.25);
    thud.frequency.exponentialRampToValueAtTime(58, now + 0.39);
    tg.gain.setValueAtTime(0.001, now + 0.24);
    tg.gain.linearRampToValueAtTime(0.11, now + 0.265);
    tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.41);
    thud.connect(tg).connect(this.output);
    thud.start(now + 0.24);
    thud.stop(now + 0.42);
  }

  // Mechanical SLR camera shutter click-clack + flash shimmer for the 2026 finale flash
  playCameraShutter() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    // Curtain open click + curtain close clack (65ms apart)
    [0, 0.065].forEach((offset, idx) => {
      const click = this.createStorySource('buffer');
      click.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = idx === 0 ? 3200 : 2400;
      bp.Q.value = 1.8;
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(0.13, now + offset);
      cg.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.032);
      click.connect(bp).connect(cg).connect(this.output);
      click.start(now + offset);
      click.stop(now + offset + 0.038);
    });

    // Subtle flash-capacitor high shimmer
    const flash = this.createStorySource('oscillator');
    const fg = this.ctx.createGain();
    flash.type = 'sine';
    flash.frequency.setValueAtTime(1760, now + 0.04);
    flash.frequency.exponentialRampToValueAtTime(2637, now + 0.28);
    fg.gain.setValueAtTime(0.025, now + 0.04);
    fg.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
    flash.connect(fg).connect(this.output);
    flash.start(now + 0.04);
    flash.stop(now + 0.34);
  }

  // One paper-cut cue when a timeline poster begins its entrance.
  playTimelineReveal() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer || document.hidden) return false;
    const tick = performance.now();
    if (tick - this.lastScrollSoundAt < 480) return false;
    this.lastScrollSoundAt = tick;
    const now = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const closing = this.cutCount++ % 2 === 0;
    source.playbackRate.value = closing ? 0.84 : 0.72;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.55;
    filter.frequency.setValueAtTime(closing ? 3400 : 2700, now);
    filter.frequency.exponentialRampToValueAtTime(1700, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.29);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.025);
    gain.gain.linearRampToValueAtTime(0.095, now + 0.13);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.31);
    source.connect(filter).connect(gain).connect(this.output);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start(now);
    source.stop(now + 0.32);

    // Brief blade contact before the longer paper-fibre rasp.
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(closing ? 2300 : 1850, now);
    click.frequency.exponentialRampToValueAtTime(900, now + 0.018);
    clickGain.gain.setValueAtTime(0.018, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);
    click.connect(clickGain).connect(this.output);
    click.onended = () => {
      click.disconnect();
      clickGain.disconnect();
    };
    click.start(now);
    click.stop(now + 0.026);
    return true;
  }

  playBeatPulse(chapterIndex = 0, accent = false) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;

    if (accent) {
      const bass = this.createStorySource('oscillator');
      const bg = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(BASS_NOTES[chapterIndex % BASS_NOTES.length], now);
      bg.gain.setValueAtTime(0.001, now);
      bg.gain.linearRampToValueAtTime(0.042, now + 0.02);
      bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
      bass.connect(bg).connect(this.output);
      bass.start(now);
      bass.stop(now + 0.36);
    }

    if (this.noiseBuffer) {
      const brush = this.createStorySource('buffer');
      brush.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = accent ? 3800 : 5200;
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(accent ? 0.016 : 0.009, now);
      ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
      brush.connect(hp).connect(ng).connect(this.output);
      brush.start(now);
      brush.stop(now + 0.04);
    }
  }

  playBouncePop(baseFreq = 260) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.createStorySource('oscillator');
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 0.65, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + 0.16);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);
    osc.connect(gain).connect(this.output);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playGlideIn() {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;

    const src = this.createStorySource('buffer');
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.9;
    filter.frequency.setValueAtTime(340, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.28);
    filter.frequency.exponentialRampToValueAtTime(420, now + 0.52);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);

    src.connect(filter).connect(gain).connect(this.output);
    src.start(now);
    src.stop(now + 0.58);

    const thud = this.createStorySource('oscillator');
    const tg = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(170, now + 0.44);
    thud.frequency.exponentialRampToValueAtTime(68, now + 0.54);
    tg.gain.setValueAtTime(0.001, now + 0.43);
    tg.gain.linearRampToValueAtTime(0.075, now + 0.45);
    tg.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);
    thud.connect(tg).connect(this.output);
    thud.start(now + 0.43);
    thud.stop(now + 0.58);
  }

  playYearStamp() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.createStorySource('oscillator');
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(430, now + 0.055);
    gain.gain.setValueAtTime(0.052, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    osc.connect(gain).connect(this.output);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playStickerSlap(index = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const pitchLift = 1 + index * 0.14;

    const osc = this.createStorySource('oscillator');
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(225 * pitchLift, now);
    osc.frequency.exponentialRampToValueAtTime(84 * pitchLift, now + 0.09);
    gain.gain.setValueAtTime(0.095, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(gain).connect(this.output);
    osc.start(now);
    osc.stop(now + 0.12);

    if (this.noiseBuffer) {
      const snap = this.createStorySource('buffer');
      snap.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 2100;
      const sg = this.ctx.createGain();
      sg.gain.setValueAtTime(0.065, now);
      sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      snap.connect(hp).connect(sg).connect(this.output);
      snap.start(now);
      snap.stop(now + 0.045);
    }
  }

  playChapterChord(chapterIndex = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = CHORDS[chapterIndex % CHORDS.length];

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = chapterIndex >= 4 ? 1300 : 940;

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.linearRampToValueAtTime(chapterIndex >= 4 ? 0.06 : 0.045, now + 0.18);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (chapterIndex >= 4 ? 3.2 : 2.5));

    filter.connect(master).connect(this.output);

    notes.forEach((freq, idx) => {
      const osc = this.createStorySource('oscillator');
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);
      osc.connect(filter);
      osc.start(now + idx * 0.035);
      osc.stop(now + (chapterIndex >= 4 ? 3.3 : 2.6));
    });
  }
}

export const sharedFieldbookSound = new FieldbookSound();
