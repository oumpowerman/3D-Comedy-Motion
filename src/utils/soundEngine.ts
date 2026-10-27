import { SfxConfig } from '../types/motion';

/**
 * Procedural Thai Comedy Sound Effects Synthesizer (Web Audio API)
 * Generates authentic cartoon/cafe comedy SFX synced to the 4.0s animation timeline
 * and routes audio to both speakers and a MediaStreamDestination for video recording.
 */
class ComedySoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;

  private ensureContext(): { ctx: AudioContext; out: GainNode } {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);

      this.streamDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.streamDest);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return { ctx: this.ctx, out: this.masterGain! };
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public getRecordingAudioStream(): MediaStream | null {
    this.ensureContext();
    return this.streamDest ? this.streamDest.stream : null;
  }

  private schedulePhase1BoingOnContext(
    ctx: BaseAudioContext,
    out: AudioNode,
    startTime: number
  ) {
    // 1. Whoosh ("ฟึ่บ!")
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, startTime);
    filter.frequency.exponentialRampToValueAtTime(1400, startTime + 0.09);
    filter.frequency.exponentialRampToValueAtTime(400, startTime + 0.18);

    const whooshGain = ctx.createGain();
    whooshGain.gain.setValueAtTime(0.01, startTime);
    whooshGain.gain.linearRampToValueAtTime(0.45, startTime + 0.06);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

    whiteNoise.connect(filter);
    filter.connect(whooshGain);
    whooshGain.connect(out);
    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.18);

    // 2. Overshoot Boing ("ดึ๋ง!")
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const boingGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, startTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(480, startTime + 0.22);
    osc.frequency.exponentialRampToValueAtTime(240, startTime + 0.45);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(26, startTime + 0.08);
    lfoGain.gain.setValueAtTime(65, startTime + 0.08);
    lfoGain.gain.exponentialRampToValueAtTime(4, startTime + 0.45);

    boingGain.gain.setValueAtTime(0.001, startTime + 0.08);
    boingGain.gain.linearRampToValueAtTime(0.55, startTime + 0.11);
    boingGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.46);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(boingGain);
    boingGain.connect(out);

    lfo.start(startTime + 0.08);
    osc.start(startTime + 0.08);
    lfo.stop(startTime + 0.46);
    osc.stop(startTime + 0.46);
  }

  private schedulePhase2UnrollPopOnContext(
    ctx: BaseAudioContext,
    out: AudioNode,
    startTime: number
  ) {
    const slideOsc = ctx.createOscillator();
    const slideGain = ctx.createGain();
    slideOsc.type = 'sawtooth';
    slideOsc.frequency.setValueAtTime(180, startTime);
    slideOsc.frequency.exponentialRampToValueAtTime(720, startTime + 0.22);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1600, startTime);

    slideGain.gain.setValueAtTime(0.22, startTime);
    slideGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.24);

    slideOsc.connect(lowpass);
    lowpass.connect(slideGain);
    slideGain.connect(out);
    slideOsc.start(startTime);
    slideOsc.stop(startTime + 0.24);

    [0.16, 0.28].forEach((offset, idx) => {
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      const baseFreq = idx === 0 ? 320 : 420;
      popOsc.frequency.setValueAtTime(baseFreq, startTime + offset);
      popOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3.1, startTime + offset + 0.085);

      popGain.gain.setValueAtTime(0.5, startTime + offset);
      popGain.gain.exponentialRampToValueAtTime(0.001, startTime + offset + 0.095);

      popOsc.connect(popGain);
      popGain.connect(out);
      popOsc.start(startTime + offset);
      popOsc.stop(startTime + offset + 0.1);
    });
  }

  private schedulePhase3TraySmashOnContext(
    ctx: BaseAudioContext,
    out: AudioNode,
    startTime: number
  ) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.35);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.06));
    }
    const slapSource = ctx.createBufferSource();
    slapSource.buffer = noiseBuffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1850, startTime);
    bandpass.Q.setValueAtTime(1.8, startTime);

    const slapGain = ctx.createGain();
    slapGain.gain.setValueAtTime(0.85, startTime);
    slapGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.32);

    slapSource.connect(bandpass);
    bandpass.connect(slapGain);
    slapGain.connect(out);
    slapSource.start(startTime);

    const trayFreqs = [540, 825, 1190, 1680, 2340];
    trayFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startTime + 0.35);

      gain.gain.setValueAtTime(0.18 / (i + 1), startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

      osc.connect(gain);
      gain.connect(out);
      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });

    [0.14, 0.26].forEach((delay, idx) => {
      const honk = ctx.createOscillator();
      const honkGain = ctx.createGain();
      honk.type = 'sawtooth';
      const startF = idx === 0 ? 580 : 490;
      honk.frequency.setValueAtTime(startF, startTime + delay);
      honk.frequency.exponentialRampToValueAtTime(startF * 0.72, startTime + delay + 0.1);

      const formant = ctx.createBiquadFilter();
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(1100, startTime + delay);
      formant.Q.setValueAtTime(3.0, startTime + delay);

      honkGain.gain.setValueAtTime(0.35, startTime + delay);
      honkGain.gain.exponentialRampToValueAtTime(0.001, startTime + delay + 0.11);

      honk.connect(formant);
      formant.connect(honkGain);
      honkGain.connect(out);
      honk.start(startTime + delay);
      honk.stop(startTime + delay + 0.12);
    });
  }

  private schedulePhase4DrumJokeOnContext(
    ctx: BaseAudioContext,
    out: AudioNode,
    startTime: number
  ) {
    const tom = ctx.createOscillator();
    const tomGain = ctx.createGain();
    tom.type = 'sine';
    tom.frequency.setValueAtTime(210, startTime);
    tom.frequency.exponentialRampToValueAtTime(85, startTime + 0.22);

    tomGain.gain.setValueAtTime(0.75, startTime);
    tomGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    tom.connect(tomGain);
    tomGain.connect(out);
    tom.start(startTime);
    tom.stop(startTime + 0.26);

    const snareTime = startTime + 0.2;
    const snareOsc = ctx.createOscillator();
    const snareGain = ctx.createGain();
    snareOsc.type = 'triangle';
    snareOsc.frequency.setValueAtTime(340, snareTime);
    snareOsc.frequency.exponentialRampToValueAtTime(150, snareTime + 0.12);

    snareGain.gain.setValueAtTime(0.65, snareTime);
    snareGain.gain.exponentialRampToValueAtTime(0.001, snareTime + 0.14);

    snareOsc.connect(snareGain);
    snareGain.connect(out);
    snareOsc.start(snareTime);
    snareOsc.stop(snareTime + 0.15);

    const cymTime = startTime + 0.34;
    const bufferSize = Math.floor(ctx.sampleRate * 0.45);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.14));
    }
    const cymNoise = ctx.createBufferSource();
    cymNoise.buffer = noiseBuffer;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(5200, cymTime);

    const cymGain = ctx.createGain();
    cymGain.gain.setValueAtTime(0.4, cymTime);
    cymGain.gain.exponentialRampToValueAtTime(0.001, cymTime + 0.44);

    cymNoise.connect(highpass);
    highpass.connect(cymGain);
    cymGain.connect(out);
    cymNoise.start(cymTime);
  }

  private schedulePhase5SwooshOutOnContext(
    ctx: BaseAudioContext,
    out: AudioNode,
    startTime: number
  ) {
    const zipOsc = ctx.createOscillator();
    const zipGain = ctx.createGain();
    zipOsc.type = 'sine';
    zipOsc.frequency.setValueAtTime(620, startTime);
    zipOsc.frequency.exponentialRampToValueAtTime(140, startTime + 0.16);
    zipOsc.frequency.exponentialRampToValueAtTime(1450, startTime + 0.36);

    zipGain.gain.setValueAtTime(0.4, startTime);
    zipGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

    zipOsc.connect(zipGain);
    zipGain.connect(out);
    zipOsc.start(startTime);
    zipOsc.stop(startTime + 0.39);

    const chimeNotes = [1046.5, 1318.5, 1567.98, 2093.0];
    chimeNotes.forEach((freq, idx) => {
      const start = startTime + 0.12 + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(out);
      osc.start(start);
      osc.stop(start + 0.23);
    });
  }

  public playPhase1Boing(sfx?: SfxConfig) {
    if (sfx && (!sfx.masterEnabled || !sfx.phase1Boing)) return;
    const { ctx, out } = this.ensureContext();
    if (sfx) this.setVolume(sfx.masterVolume);
    this.schedulePhase1BoingOnContext(ctx, out, ctx.currentTime);
  }

  public playPhase2UnrollPop(sfx?: SfxConfig) {
    if (sfx && (!sfx.masterEnabled || !sfx.phase2UnrollPop)) return;
    const { ctx, out } = this.ensureContext();
    if (sfx) this.setVolume(sfx.masterVolume);
    this.schedulePhase2UnrollPopOnContext(ctx, out, ctx.currentTime);
  }

  public playPhase3TraySmash(sfx?: SfxConfig) {
    if (sfx && (!sfx.masterEnabled || !sfx.phase3TraySmash)) return;
    const { ctx, out } = this.ensureContext();
    if (sfx) this.setVolume(sfx.masterVolume);
    this.schedulePhase3TraySmashOnContext(ctx, out, ctx.currentTime);
  }

  public playPhase4DrumJoke(sfx?: SfxConfig) {
    if (sfx && (!sfx.masterEnabled || !sfx.phase4DrumJoke)) return;
    const { ctx, out } = this.ensureContext();
    if (sfx) this.setVolume(sfx.masterVolume);
    this.schedulePhase4DrumJokeOnContext(ctx, out, ctx.currentTime);
  }

  public playPhase5SwooshOut(sfx?: SfxConfig) {
    if (sfx && (!sfx.masterEnabled || !sfx.phase5SwooshOut)) return;
    const { ctx, out } = this.ensureContext();
    if (sfx) this.setVolume(sfx.masterVolume);
    this.schedulePhase5SwooshOutOnContext(ctx, out, ctx.currentTime);
  }

  /**
   * Renders the full 4.0s procedural comedy soundtrack into a 16-bit PCM buffer
   * for embedding directly into QuickTime .MOV exports.
   */
  public async renderOfflineAudioTrack(
    sfx: SfxConfig,
    durationSeconds = 4.0,
    sampleRate = 48000
  ): Promise<Int16Array | null> {
    if (!sfx.masterEnabled) return null;
    try {
      const totalSamples = Math.floor(sampleRate * durationSeconds);
      const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);
      const master = offlineCtx.createGain();
      master.gain.setValueAtTime(
        Math.max(0, Math.min(1, sfx.masterVolume)),
        0
      );
      master.connect(offlineCtx.destination);

      if (sfx.phase1Boing) {
        this.schedulePhase1BoingOnContext(offlineCtx, master, 0.02);
      }
      if (sfx.phase2UnrollPop) {
        this.schedulePhase2UnrollPopOnContext(offlineCtx, master, 0.5);
      }
      if (sfx.phase3TraySmash) {
        this.schedulePhase3TraySmashOnContext(offlineCtx, master, 1.2);
      }
      if (sfx.phase4DrumJoke) {
        this.schedulePhase4DrumJokeOnContext(offlineCtx, master, 1.8);
      }
      if (sfx.phase5SwooshOut) {
        this.schedulePhase5SwooshOutOnContext(offlineCtx, master, 3.5);
      }

      const renderedBuffer = await offlineCtx.startRendering();
      const floatData = renderedBuffer.getChannelData(0);
      const pcm16 = new Int16Array(floatData.length);
      for (let i = 0; i < floatData.length; i++) {
        const s = Math.max(-1, Math.min(1, floatData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return pcm16;
    } catch {
      return null;
    }
  }
}

export const soundEngine = new ComedySoundEngine();
