/**
 * Later Lane - Web Audio API Synthesizer
 * 100% offline, zero external audio asset dependencies.
 * Provides calming, gentle auditory feedback and ambient focus generators.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.ambientType = 'none';
    this.ambientNode = null;
    this.ambientGain = null;
    this.ambientVolume = 0.25;
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

  toggleSound(enabled) {
    this.soundEnabled = enabled;
    if (!enabled && this.ambientNode) {
      this.stopAmbient();
    }
  }

  // Soft session start chime (calm rising fifth)
  playSessionStart() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A major triad

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  }

  // Soft urge parked chime: gentle whoosh + marimba pop
  playUrgeParked() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Break alert: warm singing bowl tone (non-jarring)
  playBreakChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fundamental = 392; // G4 singing bowl
    const harmonics = [1, 2.76, 5.4];

    harmonics.forEach((h, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h, now);

      const amp = 0.15 / (i + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  // Ambient sound generator (Brown noise / Rain / Drone)
  setAmbient(type) {
    this.init();
    if (this.ambientType === type) return;
    this.stopAmbient();
    this.ambientType = type;

    if (type === 'none' || !this.ctx) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    if (type === 'brownian' || type === 'rain') {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brownian') {
          // Brown noise integration
          lastOut = (lastOut + 0.02 * white) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          // Rain simulation: pink-filtered noise with random droplet impulse
          lastOut = (lastOut + 0.08 * white) / 1.08;
          const droplet = Math.random() > 0.998 ? (Math.random() * 0.4) : 0;
          data[i] = (lastOut * 2.2) + droplet;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter for softness
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = type === 'brownian' ? 380 : 850;

      noiseSource.connect(filter);
      filter.connect(this.ambientGain);
      noiseSource.start();
      this.ambientNode = noiseSource;

    } else if (type === 'drone') {
      // Calming 432Hz ambient drone with gentle harmonic chord
      const freqs = [108, 162, 216, 432];
      const masterNode = this.ctx.createGain();
      masterNode.gain.value = 0.08;

      freqs.forEach(f => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);
        osc.connect(masterNode);
        osc.start();
      });

      masterNode.connect(this.ambientGain);
      this.ambientNode = masterNode;
    }
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        if (this.ambientNode.stop) this.ambientNode.stop();
        if (this.ambientNode.disconnect) this.ambientNode.disconnect();
      } catch (e) {
        console.warn('Ambient stop error', e);
      }
      this.ambientNode = null;
    }
    this.ambientType = 'none';
  }

  setVolume(vol) {
    this.ambientVolume = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
    }
  }
}

window.soundEngine = new SoundEngine();

