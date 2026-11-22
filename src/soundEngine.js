// Motore Audio Ibrido (Streaming 1h Ambient + Buffer SFX con Sync Offset/Delay e Boost Volume)
// 100% Self-Hosted, Touch-Safe & Mobile Safari/Chrome Safe

export const AUDIO_CONFIG = {
  ambientTargetVolume: 0.42,  // Volume massimo del loop ambient (0.0 - 1.0)
  ambientFadeInMs: 1400,      // Durata fade-in all'avvio (ms)
  ambientFadeOutMs: 900,      // Durata fade-out allo spegnimento (ms)
  ambientStartOffsetSec: 0,   // Secondo da cui far partire l'ambient

  // Volumi singoli SFX (valori > 1.0 applicano un boost pulito tramite limiter)
  sfxVolumes: {
    hover: 0.45,
    click: 0.78,
    swipe: 0.78,
    overdrive: 0.90,
    correct: 1.65,
    wrong: 1.65
  },

  // Taglio silenzio iniziale del file MP3 (in SECONDI)
  sfxOffsetsSec: {
    hover: 0.0,
    click: 0.0,
    swipe: 0.0,
    overdrive: 0.0,
    correct: 0.0,
    wrong: 0.0
  },

  // Ritardo intenzionale prima della riproduzione (in MILLISECONDI)
  sfxDelaysMs: {
    hover: 0,
    click: 0,
    swipe: 0,
    overdrive: 0,
    correct: 0,
    wrong: 0
  }
};

const CUSTOM_TRACKS = {
  ambient: ['/audio/ambient.mp3'],
  hover: ['/audio/hover.mp3'],
  click: ['/audio/click.mp3'],
  swipe: ['/audio/swipe.mp3'],
  overdrive: ['/audio/overdrive.mp3'],
  correct: ['/audio/correct.mp3', '/audio/correct answer.mp3'],
  wrong: ['/audio/wrong.mp3']
};

const TRACK_ALIASES = {
  success: 'correct',
  error: 'wrong'
};

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sfxLimiter = null;
    this.enabled = false;
    this.preloaded = false;
    this.ambientEl = null;
    this.ambientMode = 'none'; // 'file' | 'synth' | 'none'
    this.fadeRaf = null;
    this.synthAmbientNodes = null;
    this.buffers = {};
    this.missingFiles = new Set();
    this.lastHoverTime = 0;

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAmbient();
        } else if (this.enabled) {
          this.resumeAmbient();
        }
      });
    }
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        const limiter = this.ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-4, this.ctx.currentTime);
        limiter.knee.setValueAtTime(6, this.ctx.currentTime);
        limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
        limiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
        limiter.release.setValueAtTime(0.12, this.ctx.currentTime);
        limiter.connect(this.ctx.destination);
        this.sfxLimiter = limiter;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  unlockHardware() {
    this.initContext();
    if (this.ctx) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch {}
    }
    if (!this.preloaded) {
      this.preloaded = true;
      this.preloadCustomFiles();
    }
  }

  async fetchFirstValidBuffer(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(encodeURI(url));
        if (!res.ok) continue;
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) continue;
        const arrayBuf = await res.arrayBuffer();
        if (!this.ctx) continue;
        const decoded = await this.ctx.decodeAudioData(arrayBuf);
        if (decoded) return decoded;
      } catch {
        // Prova il candidato successivo
      }
    }
    return null;
  }

  preloadCustomFiles() {
    Object.entries(CUSTOM_TRACKS).forEach(([key, urls]) => {
      if (key === 'ambient') return;
      this.fetchFirstValidBuffer(urls).then((decoded) => {
        if (decoded) {
          this.buffers[key] = decoded;
        } else {
          this.missingFiles.add(key);
        }
      });
    });
  }

  toggle() {
    this.unlockHardware();
    this.enabled = !this.enabled;

    if (this.enabled) {
      this.startAmbient();
      this._triggerSound('click');
    } else {
      this.stopAmbient();
    }
    return this.enabled;
  }

  fadeAmbientTo(targetVol, durationMs, onComplete) {
    if (this.fadeRaf) {
      cancelAnimationFrame(this.fadeRaf);
      this.fadeRaf = null;
    }
    if (!this.ambientEl) {
      onComplete?.();
      return;
    }

    const startVol = this.ambientEl.volume;
    const startTime = performance.now();

    const step = (now) => {
      if (!this.ambientEl) return;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / Math.max(1, durationMs));
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      this.ambientEl.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * eased));

      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(step);
      } else {
        this.fadeRaf = null;
        onComplete?.();
      }
    };

    this.fadeRaf = requestAnimationFrame(step);
  }

  startAmbient() {
    if (!this.enabled) return;

    if (!this.missingFiles.has('ambient')) {
      if (!this.ambientEl) {
        const audio = new Audio(CUSTOM_TRACKS.ambient[0]);
        audio.loop = true;
        // Streaming on-demand: non scarica gli 83MB finché non viene avviato
        audio.preload = 'none';
        audio.volume = 0.15;
        audio.addEventListener('error', () => {
          this.missingFiles.add('ambient');
          this.ambientEl = null;
          if (this.enabled) this.startSynthAmbient();
        });
        this.ambientEl = audio;
      }

      if (AUDIO_CONFIG.ambientStartOffsetSec > 0 && this.ambientEl.currentTime < 0.5) {
        try {
          this.ambientEl.currentTime = AUDIO_CONFIG.ambientStartOffsetSec;
        } catch {}
      }

      this.ambientEl
        .play()
        .then(() => {
          this.ambientMode = 'file';
          this.fadeAmbientTo(AUDIO_CONFIG.ambientTargetVolume, AUDIO_CONFIG.ambientFadeInMs);
        })
        .catch(() => {
          this.startSynthAmbient();
        });
      return;
    }

    this.startSynthAmbient();
  }

  startSynthAmbient() {
    if (!this.enabled || this.synthAmbientNodes) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(0.01, now);
    master.gain.exponentialRampToValueAtTime(0.08, now + AUDIO_CONFIG.ambientFadeInMs / 1000);
    master.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(65.41, now);
    osc2.frequency.setValueAtTime(98.0, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);

    const bufferSize = this.ctx.sampleRate * 3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(380, now);
    windFilter.Q.setValueAtTime(2.5, now);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.22, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(master);

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);

    osc1.start();
    osc2.start();
    noise.start();

    this.synthAmbientNodes = { master, osc1, osc2, noise };
    this.ambientMode = 'synth';
  }

  pauseAmbient() {
    if (this.ambientEl && !this.ambientEl.paused) {
      this.fadeAmbientTo(0, 350, () => {
        if (this.ambientEl && document.hidden) this.ambientEl.pause();
      });
    }
    if (this.synthAmbientNodes && this.ctx) {
      this.synthAmbientNodes.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    }
  }

  resumeAmbient() {
    if (!this.enabled) return;
    if (this.ambientMode === 'file' && this.ambientEl) {
      this.ambientEl
        .play()
        .then(() => {
          this.fadeAmbientTo(AUDIO_CONFIG.ambientTargetVolume, AUDIO_CONFIG.ambientFadeInMs);
        })
        .catch(() => {});
    } else if (this.ambientMode === 'synth' && this.synthAmbientNodes && this.ctx) {
      this.synthAmbientNodes.master.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.5);
    }
  }

  stopAmbient() {
    if (this.ambientEl) {
      this.fadeAmbientTo(0, AUDIO_CONFIG.ambientFadeOutMs, () => {
        if (!this.enabled && this.ambientEl) {
          this.ambientEl.pause();
        }
      });
    }
    if (this.synthAmbientNodes && this.ctx) {
      const { master, osc1, osc2, noise } = this.synthAmbientNodes;
      const fadeSec = AUDIO_CONFIG.ambientFadeOutMs / 1000;
      master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, fadeSec / 3);
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          noise.stop();
        } catch {}
      }, AUDIO_CONFIG.ambientFadeOutMs + 100);
      this.synthAmbientNodes = null;
    }
    this.ambientMode = 'none';
  }

  play(rawType) {
    if (!this.enabled) return;
    const type = TRACK_ALIASES[rawType] || rawType;

    // Evita il doppio suono (hover + click) sui dispositivi touch
    if (type === 'hover') {
      if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return;
      }
      const nowMs = performance.now();
      if (nowMs - this.lastHoverTime < 55) return;
      this.lastHoverTime = nowMs;
    }

    const delayMs = AUDIO_CONFIG.sfxDelaysMs[type] || 0;
    if (delayMs > 0) {
      setTimeout(() => this._triggerSound(type), delayMs);
    } else {
      this._triggerSound(type);
    }
  }

  _triggerSound(type) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const outputNode = this.sfxLimiter || this.ctx.destination;

    // 1. File MP3 locale decodificato
    if (this.buffers[type]) {
      const now = this.ctx.currentTime;
      const buffer = this.buffers[type];
      const offset = Math.min(AUDIO_CONFIG.sfxOffsetsSec[type] || 0, Math.max(0, buffer.duration - 0.05));
      const playDuration = Math.max(0.05, buffer.duration - offset);

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const gain = this.ctx.createGain();
      const targetGain = AUDIO_CONFIG.sfxVolumes[type] ?? 0.85;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 0.012);
      if (playDuration > 0.06) {
        gain.gain.setValueAtTime(targetGain, now + playDuration - 0.025);
        gain.gain.linearRampToValueAtTime(0.0001, now + playDuration);
      }

      src.connect(gain);
      gain.connect(outputNode);
      src.start(now, offset);
      return;
    }

    // 2. Fallback sintetico immediato
    const now = this.ctx.currentTime;

    if (type === 'hover') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.025);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'click') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'swipe') {
      const len = Math.floor(this.ctx.sampleRate * 0.16);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(outputNode);
      noise.start(now);
    } else if (type === 'overdrive') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.38);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.38);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.43);
    } else if (type === 'correct') {
      [523.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.32, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(outputNode);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.19);
      });
    } else if (type === 'wrong') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(115, now + 0.16);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(outputNode);
      osc.start(now);
      osc.stop(now + 0.19);
    }
  }
}

export const soundEngine = new SoundEngine();