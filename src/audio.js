// Procedural Web Audio API sound effects for realistic immersion
class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFootstep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Noise buffer for foot contact crunch/tap
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380 + Math.random() * 80, t);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.08);
  }

  playDoorOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  playCabinet(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(open ? 190 : 130, t);
    osc.frequency.exponentialRampToValueAtTime(open ? 110 : 70, t + 0.16);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  playFridge(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    if (open) {
      // Suction unseal release hiss & click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    } else {
      // Magnetic seal thump
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    }
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.20);
  }

  playBurner(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (open) {
      // 3 fast electric piezo spark clicks
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(2200 + i * 200, t + i * 0.07);
        gain.gain.setValueAtTime(0.05, t + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.03);
      }
      // Warm gas combustion whoosh
      const bufSize = Math.floor(this.ctx.sampleRate * 0.28);
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) out[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t + 0.22);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.09, t + 0.26);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t + 0.22);
      noise.stop(t + 0.50);
    } else {
      // Gas knob click cutoff
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(320, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  playWaterStream(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (open) {
      if (this.waterSource) return;
      const bufSize = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        out[i] = (Math.random() * 2 - 1) * 0.35;
      }
      this.waterSource = this.ctx.createBufferSource();
      this.waterSource.buffer = buf;
      this.waterSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(820, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.4, this.ctx.currentTime);

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.waterGain.gain.exponentialRampToValueAtTime(0.075, this.ctx.currentTime + 0.15);

      this.waterSource.connect(filter);
      filter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      this.waterSource.start();
    } else {
      if (this.waterGain && this.waterSource) {
        const t = this.ctx.currentTime;
        this.waterGain.gain.setValueAtTime(this.waterGain.gain.value, t);
        this.waterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        const src = this.waterSource;
        setTimeout(() => {
          try { src.stop(); src.disconnect(); } catch {}
        }, 150);
        this.waterSource = null;
        this.waterGain = null;
      }
    }
  }

  playMicrowave(open = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (open) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(360, t);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }
}

export const audio = new AudioManager();
