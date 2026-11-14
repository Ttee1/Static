// Web Audio API Synthesizer for paper page flip sound and ambient lo-fi magazine beats

class AudioController {
  private ctx: AudioContext | null = null;
  private isSoundEnabled = true;
  private isMusicPlaying = false;
  private currentTrackIndex = 0;
  private musicOscillators: OscillatorNode[] = [];
  private musicGainNode: GainNode | null = null;
  private intervalTimer: any = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic paper-rustle sound effect
  public playPageFlip() {
    if (!this.isSoundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 0.15; // 150ms of paper rustle
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate brown/pink noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.15;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter centered at 900Hz for paper texture
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio not permitted or supported
    }
  }

  public toggleSound(enabled?: boolean) {
    if (enabled !== undefined) {
      this.isSoundEnabled = enabled;
    } else {
      this.isSoundEnabled = !this.isSoundEnabled;
    }
    return this.isSoundEnabled;
  }

  public getSoundEnabled() {
    return this.isSoundEnabled;
  }

  // Synthesized chill ambient loop representing the magazine's late-night studio soundtrack
  public toggleSoundtrack(trackIndex = 0, onStateChange?: (playing: boolean) => void) {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isMusicPlaying) {
      this.stopSoundtrack();
      if (onStateChange) onStateChange(false);
      return false;
    } else {
      this.currentTrackIndex = trackIndex;
      this.startAmbientBeat(trackIndex);
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  private startAmbientBeat(trackIndex: number) {
    if (!this.ctx) return;
    this.stopSoundtrack();

    this.isMusicPlaying = true;
    const now = this.ctx.currentTime;

    // Chord progressions for the 5 tracks
    const progressions = [
      [220, 261.63, 329.63, 392], // A minor 7 (Loud on a Tuesday)
      [174.61, 220, 261.63, 329.63], // F maj 7 (Kerning Blind)
      [196, 246.94, 293.66, 349.23], // G dominant 7 (Render Farm Blues)
      [164.81, 196, 246.94, 293.66], // E minor 7 (Invoice Interlude)
      [246.94, 293.66, 369.99, 440]  // B minor 7 (Screen Share)
    ];

    const chord = progressions[trackIndex % progressions.length];

    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(0.01, now);
    this.musicGainNode.gain.linearRampToValueAtTime(0.06, now + 1.5);
    this.musicGainNode.connect(this.ctx.destination);

    // Warm Rhodes / Synth Pad
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * (idx === 0 ? 0.5 : 1), now);

      // Subtle detune for analog warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + idx * 150, now);

      osc.connect(filter);
      filter.connect(this.musicGainNode!);
      osc.start();
      this.musicOscillators.push(osc);
    });

    // Subtle 808-style rhythmic pulse every 2 seconds
    let beatStep = 0;
    this.intervalTimer = setInterval(() => {
      if (!this.ctx || !this.isMusicPlaying) return;
      try {
        const beatTime = this.ctx.currentTime;
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(110, beatTime);
        kickOsc.frequency.exponentialRampToValueAtTime(42, beatTime + 0.15);

        kickGain.gain.setValueAtTime(0.08, beatTime);
        kickGain.gain.exponentialRampToValueAtTime(0.0001, beatTime + 0.35);

        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.start(beatTime);
        kickOsc.stop(beatTime + 0.36);

        beatStep++;
      } catch {
        // Safe fail
      }
    }, 1800);
  }

  public stopSoundtrack() {
    this.isMusicPlaying = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.musicGainNode && this.ctx) {
      try {
        this.musicGainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {}
    }
    setTimeout(() => {
      this.musicOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.musicOscillators = [];
      this.musicGainNode = null;
    }, 550);
  }

  public isPlaying() {
    return this.isMusicPlaying;
  }
}

export const audioController = new AudioController();
